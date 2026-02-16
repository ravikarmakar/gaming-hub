import Team from "../team/team.model.js";
import User from "../user/user.model.js";
import Organizer from "../organizer/organizer.model.js";
import Invitation from "./invitation.model.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { redis } from "../../shared/config/redis.js";
import { logger } from "../../shared/utils/logger.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { invalidateCacheWithRetry } from "../../shared/utils/cache.js";

/**
 * Atomic service to accept a Team or Organization invitation
 */
export const acceptInvitationService = async (invitationId, userId) => {
    const { resultMessage, entityModel, entityId, username, avatar } = await withOptionalTransaction(async (session) => {
        const inviteQuery = Invitation.findById(invitationId);
        if (session) inviteQuery.session(session);
        const invite = await inviteQuery;
        if (!invite) throw new CustomError("Invitation not found", 404);
        if (invite.status !== "pending") throw new CustomError(`Invitation already ${invite.status}`, 400);

        // Security check: Ensure the user is the receiver
        if (invite.receiver.toString() !== userId.toString()) {
            throw new CustomError("Access Denied: You are not the recipient of this invitation", 403);
        }

        const userQuery = User.findById(userId);
        if (session) userQuery.session(session);
        const user = await userQuery;
        if (!user) throw new CustomError("User not found", 404);

        let resultMessage = "";

        if (invite.entityModel === "Team") {
            const teamId = invite.entityId;
            const teamQuery = Team.findById(teamId);
            if (session) teamQuery.session(session);
            const team = await teamQuery;
            if (!team || team.isDeleted) throw new CustomError("Team not found or deleted", 404);
            if (user.teamId) throw new CustomError("You are already in a team", 400);

            // Check Member Limit (Max 20)
            if (team.teamMembers.length >= 20) throw new CustomError("Team has reached its member limit (20).", 400);

            // Standardize roleInTeam
            const roleInTeam = invite.role === Roles.TEAM.MANAGER ? "manager" : "player";

            // Update Team Roster
            await Team.findByIdAndUpdate(
                teamId,
                {
                    $push: {
                        teamMembers: {
                            user: user._id,
                            username: user.username,
                            avatar: user.avatar,
                            roleInTeam: roleInTeam,
                            joinedAt: new Date(),
                            isActive: true
                        }
                    }
                },
                { session }
            );

            // Update User
            await User.findByIdAndUpdate(
                userId,
                {
                    $set: { teamId: teamId },
                    $push: {
                        roles: {
                            scope: Scopes.TEAM,
                            role: invite.role || Roles.TEAM.PLAYER,
                            scopeId: teamId,
                            scopeModel: "Team",
                        },
                    },
                },
                { session }
            );

            resultMessage = `You have successfully joined ${team.teamName}`;

        } else if (invite.entityModel === "Organizer") {
            const orgId = invite.entityId;
            const orgQuery = Organizer.findById(orgId);
            if (session) orgQuery.session(session);
            const org = await orgQuery;
            if (!org || org.isDeleted) throw new CustomError("Organization not found or deleted", 404);
            if (user.orgId) throw new CustomError("You are already in an organization", 400);

            // Update User
            await User.findByIdAndUpdate(
                userId,
                {
                    $set: { orgId: orgId },
                    $push: {
                        roles: {
                            scope: Scopes.ORG,
                            role: invite.role || Roles.ORG.STAFF,
                            scopeId: orgId,
                            scopeModel: "Organizer",
                        },
                    },
                },
                { session }
            );

            // Update Organizer Stats
            await Organizer.findByIdAndUpdate(orgId, { $inc: { "stats.memberCount": 1 } }, { session });

            resultMessage = `You have successfully joined ${org.name}`;
        }

        // Update Invitation Status
        invite.status = "accepted";
        await invite.save({ session });

        // Notify the person who sent the invite that it was accepted
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

        return { resultMessage, entityModel: invite.entityModel, entityId: invite.entityId, username: user.username, avatar: user.avatar };
    });

    // Invalidate Redis Caches (post-commit)
    try {
        const keys = [`user_profile:${userId}`];
        if (entityModel === "Team") {
            keys.push(`team_details:${entityId}`);
        } else if (entityModel === "Organizer") {
            keys.push(`org_details:${entityId}`);
        }
        await invalidateCacheWithRetry(keys);

        // Socket Emission (post-commit)
        if (entityModel === "Team") {
            const { emitMemberJoined } = await import("../team/team.socket.js");
            emitMemberJoined(entityId, {
                userId,
                username,
                avatar,
                role: "player"
            });
        }
    } catch (e) {
        logger.warn("Post-commit operations failed in acceptInvitationService", e);
    }

    return resultMessage;
};
