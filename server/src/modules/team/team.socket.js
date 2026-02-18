import { emitToTeam } from "../../shared/config/socket.config.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * Team Socket Event Types
 */
export const TEAM_EVENTS = {
    MEMBER_JOINED: "team:member:joined",
    MEMBER_LEFT: "team:member:left",
    ROLE_UPDATED: "team:role:updated",
    OWNER_TRANSFERRED: "team:owner:transferred",
    TEAM_UPDATED: "team:updated",
    TEAM_DELETED: "team:deleted",
    JOIN_REQUEST_CREATED: "team:join_request:created",
};

/**
 * Emit when a new join request is created for the team
 */
export const emitJoinRequestCreated = (teamId, requestData) => {
    try {
        emitToTeam(teamId, TEAM_EVENTS.JOIN_REQUEST_CREATED, {
            request: requestData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit join request created event:", error);
    }
};

/**
 * Emit when a new member joins the team
 * @param {string} teamId
 * @param {Object} memberData - Minimal delta: { userId, username, avatar, roleInTeam }
 */
export const emitMemberJoined = (teamId, memberData) => {
    try {
        emitToTeam(teamId, TEAM_EVENTS.MEMBER_JOINED, {
            member: memberData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit member joined event:", error);
    }
};

/**
 * Emit when a member leaves or is removed from the team
 */
export const emitMemberLeft = (teamId, userId, reason = "removed") => {
    try {
        emitToTeam(teamId, TEAM_EVENTS.MEMBER_LEFT, {
            userId,
            reason, // 'removed', 'left', 'kicked'
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit member left event:", error);
    }
};

/**
 * Emit when a member's role is updated
 */
export const emitRoleUpdated = (teamId, userId, newRole, oldRole) => {
    try {
        emitToTeam(teamId, TEAM_EVENTS.ROLE_UPDATED, {
            userId,
            newRole,
            oldRole,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit role updated event:", error);
    }
};

/**
 * Emit when team ownership is transferred
 */
export const emitOwnerTransferred = (teamId, newOwnerId, oldOwnerId) => {
    try {
        emitToTeam(teamId, TEAM_EVENTS.OWNER_TRANSFERRED, {
            newOwnerId,
            oldOwnerId,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit owner transferred event:", error);
    }
};

/**
 * Emit generic team update event
 */
export const emitTeamUpdated = (teamId, updateType, data = {}) => {
    try {
        emitToTeam(teamId, TEAM_EVENTS.TEAM_UPDATED, {
            updateType,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit team updated event:", error);
    }
};

/**
 * Emit when a team is deleted
 */
export const emitTeamDeleted = (teamId) => {
    try {
        emitToTeam(teamId, TEAM_EVENTS.TEAM_DELETED, {
            teamId,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit team deleted event:", error);
    }
};
