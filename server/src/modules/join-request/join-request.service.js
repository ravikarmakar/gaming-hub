import JoinRequest from "./join-request.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { emitMemberJoined } from "../team/team.socket.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { invalidateCacheWithRetry } from "../../shared/utils/cache.js";
import { logger } from "../../shared/utils/logger.js";
import { getStrategy } from "./target.strategy.js";

/**
 * Handles accepting or rejecting a join request.
 * Can be called from the controller or from the notification action handler.
 * 
 * @param {string} requestId - The ID of the JoinRequest
 * @param {string} action - 'accepted' or 'rejected'
 * @param {string} userId - The ID of the user performing the action
 * @returns {Object} { strategyResult, targetModel }
 */
export const handleJoinRequestService = async (requestId, action, userId) => {
    if (!["accepted", "rejected"].includes(action)) {
        throw new CustomError("Invalid action. Use 'accepted' or 'rejected'", 400);
    }

    const { strategyResult, targetModel, joinRequest } = await withOptionalTransaction(async (session) => {
        const jrQuery = JoinRequest.findById(requestId).populate("target");
        if (session) jrQuery.session(session);
        const joinRequest = await jrQuery;
        if (!joinRequest) {
            console.error("DEBUG JR_SERVICE: Join request not found for ID:", requestId);
            throw new CustomError("Join request not found", 404);
        }

        if (joinRequest.status !== "pending") {
            throw new CustomError(`Request has already been ${joinRequest.status}`, 400);
        }

        let strategyResult = null;
        const strategy = getStrategy(joinRequest.targetModel);

        if (action === "accepted") {
            // strategy handles specific logic (added to roster, notify, etc)
            try {
                strategyResult = await strategy.acceptJoinRequest(joinRequest.requester, joinRequest.target._id, userId, session);
            } catch (err) {
                console.error("DEBUG JR_SERVICE STRATEGY THROW:", err);
                throw err;
            }

            joinRequest.status = "accepted";
            joinRequest.handledBy = userId;
            joinRequest.handledAt = new Date();
            await joinRequest.save({ session });

            // Auto-reject other pending requests for same targetModel (Team/Org)
            if (["Team", "Organizer"].includes(joinRequest.targetModel)) {
                await JoinRequest.updateMany(
                    {
                        requester: joinRequest.requester,
                        targetModel: joinRequest.targetModel,
                        status: "pending",
                        _id: { $ne: requestId }
                    },
                    {
                        $set: {
                            status: "rejected",
                            message: `User has joined another ${joinRequest.targetModel.toLowerCase()}`,
                            handledBy: userId,
                            handledAt: new Date()
                        }
                    },
                    { session }
                );
            }
        } else {
            joinRequest.status = "rejected";
            joinRequest.handledBy = userId;
            joinRequest.handledAt = new Date();
            await joinRequest.save({ session });

            await createNotification({
                recipient: joinRequest.requester,
                sender: userId,
                type: "REQUEST_DECLINED",
                content: {
                    title: "Request Declined",
                    message: `Your request for ${joinRequest.targetModel.toLowerCase()} access was declined.`,
                },
                relatedData: { targetId: joinRequest.target._id, model: joinRequest.targetModel },
            }, { session });
        }

        return { strategyResult, targetModel: joinRequest.targetModel, joinRequest };
    });

    // Post-transaction consistency operations
    if (action === "accepted" && strategyResult) {
        if (strategyResult.cacheKeys?.length > 0) {
            invalidateCacheWithRetry(strategyResult.cacheKeys).catch(err => logger.warn(`Cache invalidation failed: ${err.message}`));
        }

        if (strategyResult.socketData) {
            emitMemberJoined(strategyResult.socketData.teamId, strategyResult.socketData.memberData);
        }

        // Notify the requester to update their own profile/dashboard
        try {
            if (joinRequest?.requester) {
                const { emitProfileUpdate } = await import("../user/user.socket.js");
                emitProfileUpdate(joinRequest.requester, {
                    teamId: strategyResult.socketData?.teamId || strategyResult.socketData?.org?._id || strategyResult.requesterId,
                    action: "joined"
                });
            }
        } catch (err) {
            logger.warn("Failed to emit profile update for join request requester:", err.message);
        }
    }

    return { strategyResult, targetModel };
};
