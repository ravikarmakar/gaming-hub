import { emitToOrg } from "../../shared/config/socket.config.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * Organizer Socket Event Types
 */
export const ORG_SOCKET_EVENTS = {
    MEMBER_JOINED: "org:member:joined",
    MEMBER_LEFT: "org:member:left",
    ROLE_UPDATED: "org:role:updated",
    OWNER_TRANSFERRED: "org:owner:transferred",
    ORG_UPDATED: "org:updated",
    ORG_DELETED: "org:deleted",
};

/**
 * Emit when a new member joins the organization
 */
export const emitOrgMemberJoined = (orgId, memberIds) => {
    try {
        emitToOrg(orgId, ORG_SOCKET_EVENTS.MEMBER_JOINED, {
            orgId,
            memberIds: Array.isArray(memberIds) ? memberIds : [memberIds],
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit org member joined event:", error);
    }
};

/**
 * Emit when a member leaves or is removed from the organization
 */
export const emitOrgMemberLeft = (orgId, memberId) => {
    try {
        emitToOrg(orgId, ORG_SOCKET_EVENTS.MEMBER_LEFT, {
            orgId,
            memberId,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit org member left event:", error);
    }
};

/**
 * Emit when a member's role is updated in the organization
 */
export const emitOrgRoleUpdated = (orgId, memberId, newRole) => {
    try {
        emitToOrg(orgId, ORG_SOCKET_EVENTS.ROLE_UPDATED, {
            orgId,
            memberId,
            newRole,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit org role updated event:", error);
    }
};

/**
 * Emit when organization ownership is transferred
 */
export const emitOrgOwnerTransferred = (orgId, newOwnerId, oldOwnerId) => {
    try {
        emitToOrg(orgId, ORG_SOCKET_EVENTS.OWNER_TRANSFERRED, {
            orgId,
            newOwnerId,
            oldOwnerId,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit org owner transferred event:", error);
    }
};

/**
 * Emit generic organization update event
 */
export const emitOrgUpdated = (orgId) => {
    try {
        emitToOrg(orgId, ORG_SOCKET_EVENTS.ORG_UPDATED, {
            orgId,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit org updated event:", error);
    }
};

/**
 * Emit when an organization is deleted
 */
export const emitOrgDeleted = (orgId) => {
    try {
        emitToOrg(orgId, ORG_SOCKET_EVENTS.ORG_DELETED, {
            orgId,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit org deleted event:", error);
    }
};
