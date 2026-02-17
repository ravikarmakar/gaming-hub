import User from "../user/user.model.js";
import Invitation from "./invitation.model.js";
import { logger } from "../../shared/utils/logger.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { invalidateCacheWithRetry } from "../../shared/utils/cache.js";
import { getStrategy } from "../join-request/target.strategy.js";

/**
 * Atomic service to accept a Team or Organization invitation
 */
export const acceptInvitationService = async (invitationId, userId) => {
    const { resultMessage, entityModel, entityId, socketData, cacheKeys, senderId } = await withOptionalTransaction(async (session) => {
        const inviteQuery = Invitation.findById(invitationId);
        if (session) inviteQuery.session(session);
        const invite = await inviteQuery;
        if (!invite) throw new CustomError("Invitation not found", 404);
        if (invite.status !== "pending") throw new CustomError(`Invitation already ${invite.status}`, 400);

        // Security check: Ensure the user is the receiver
        if (invite.receiver.toString() !== userId.toString()) {
            throw new CustomError("Access Denied: You are not the recipient of this invitation", 403);
        }

        const strategy = getStrategy(invite.entityModel);

        // Delegate specific acceptance logic to strategy
        const { resultMessage, cacheKeys, socketData } = await strategy.acceptInvitation(userId, invite.entityId, invite.role, session);

        // Update Invitation Status
        invite.status = "accepted";
        await invite.save({ session });

        // Notify the person who sent the invite that it was accepted
        const user = await User.findById(userId).session(session);
        await createNotification({
            recipient: invite.sender,
            sender: userId,
            type: invite.entityModel === "Team" ? "TEAM_JOIN_SUCCESS" : "ORG_JOIN_SUCCESS",
            content: {
                title: "Invitation Accepted!",
                message: `${user.username} has joined your ${invite.entityModel.toLowerCase()}.`,
            },
            relatedData: {
                [invite.entityModel === "Team" ? "teamId" : "orgId"]: invite.entityId,
                inviteId: invite._id,
            },
        }, { session });

        return { resultMessage, entityModel: invite.entityModel, entityId: invite.entityId, socketData, cacheKeys, senderId: invite.sender };
    });

    // Post-commit operations
    try {
        if (cacheKeys?.length > 0) {
            await invalidateCacheWithRetry(cacheKeys);
        }

        // Socket Emission
        if (socketData && entityModel === "Team") {
            const { emitMemberJoined } = await import("../team/team.socket.js");
            emitMemberJoined(socketData.teamId, socketData.memberData);

            // Also notify the joining user to update their own profile/dashboard
            const { emitProfileUpdate } = await import("../user/user.socket.js");
            emitProfileUpdate(userId, { teamId: socketData.teamId, action: "joined" });
        }
    } catch (e) {
        logger.warn("Post-commit operations failed in acceptInvitationService", e);
    }

    return resultMessage;
};
