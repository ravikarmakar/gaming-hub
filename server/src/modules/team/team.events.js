import EventEmitter from "events";
import { createNotificationWithActions } from "../notification/notification.service.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * TeamEventEmitter handles internal events within the Team module.
 * This allows side effects (like notifications) to be decoupled from the core business logic.
 */
class TeamEventEmitter extends EventEmitter { }

const teamEvents = new TeamEventEmitter();

// Event Types
export const TEAM_EVENT_TYPES = {
    MEMBER_JOINED: "member:joined",
    MEMBER_LEFT: "member:left",
    MEMBER_KICKED: "member:kicked",
    OWNER_TRANSFERRED: "owner:transferred",
    ROLE_UPDATED: "role:updated",
    TEAM_DELETED: "team:deleted",
};

let isInitialized = false;

/**
 * Initialize listeners for Team events.
 * This can be expanded to include logging, analytics, etc.
 */
export const initTeamListeners = () => {
    if (isInitialized) return;
    isInitialized = true;
    // Notification for Member Kicked
    teamEvents.on(TEAM_EVENT_TYPES.MEMBER_KICKED, async ({ team, memberId, actorId, actorRole }) => {
        try {
            await createNotificationWithActions({
                recipient: memberId,
                sender: actorId,
                type: "TEAM_KICK",
                title: "Kicked from Team",
                message: `You have been removed from the team ${team.teamName} by the team ${actorRole}.`,
                relatedData: {
                    teamId: team._id,
                },
            });
        } catch (error) {
            logger.error("Notification failed for TEAM_KICK event:", error);
        }
    });

    // Notification for Member Left
    teamEvents.on(TEAM_EVENT_TYPES.MEMBER_LEFT, async ({ team, memberId, memberName }) => {
        try {
            await createNotificationWithActions({
                recipient: team.captain,
                sender: memberId,
                type: "TEAM_LEAVE",
                title: "Member Left Team",
                message: `${memberName} has left the team ${team.teamName}.`,
                relatedData: {
                    teamId: team._id,
                },
            });
        } catch (error) {
            logger.error("Notification failed for TEAM_LEAVE event:", error);
        }
    });

    // Notification for Join Success
    teamEvents.on(TEAM_EVENT_TYPES.MEMBER_JOINED, async ({ team, memberId, actorId }) => {
        try {
            await createNotificationWithActions({
                recipient: memberId,
                sender: actorId,
                type: "TEAM_JOIN_SUCCESS",
                title: "Request Accepted!",
                message: `You joined ${team.teamName}.`,
                relatedData: { teamId: team._id },
            });
        } catch (error) {
            logger.error("Notification failed for TEAM_JOIN_SUCCESS event:", error);
        }
    });

    // Notification for Role Updated
    teamEvents.on(TEAM_EVENT_TYPES.ROLE_UPDATED, async ({ team, memberId, newRole }) => {
        try {
            await createNotificationWithActions({
                recipient: memberId,
                sender: team.captain,
                type: "TEAM_ROLE_UPDATE",
                title: "Role Updated",
                message: `Your role in team ${team.teamName} has been updated to ${newRole}.`,
                relatedData: { teamId: team._id },
            });
        } catch (error) {
            logger.error("Notification failed for ROLE_UPDATED event:", error);
        }
    });

    // Notification for Owner Transferred
    teamEvents.on(TEAM_EVENT_TYPES.OWNER_TRANSFERRED, async ({ team, newOwnerId, oldOwnerId }) => {
        try {
            await createNotificationWithActions({
                recipient: newOwnerId,
                sender: oldOwnerId,
                type: "TEAM_OWNERSHIP_TRANSFERRED",
                title: "Ownership Transferred",
                message: `You are now the captain of ${team.teamName}.`,
                relatedData: { teamId: team._id },
            });
        } catch (error) {
            logger.error("Notification failed for OWNER_TRANSFERRED event:", error);
        }
    });

    // Real-time refresh for Team Deleted
    teamEvents.on(TEAM_EVENT_TYPES.TEAM_DELETED, async ({ teamId, memberIds }) => {
        try {
            const { emitTeamDeleted } = await import("./team.socket.js");
            const { emitProfileUpdate } = await import("../user/user.socket.js");

            // 1. Notify all members via team room (for team-specific UI cleanup)
            emitTeamDeleted(teamId);

            // 2. Notify each member via personal room (for global profile/sidebar refresh)
            if (memberIds && Array.isArray(memberIds)) {
                memberIds.forEach(userId => {
                    emitProfileUpdate(userId, {
                        reason: "team_deleted",
                        teamId
                    });
                });
            }
        } catch (error) {
            logger.error("Real-time refresh failed for TEAM_DELETED event:", error);
        }
    });
};

export default teamEvents;
