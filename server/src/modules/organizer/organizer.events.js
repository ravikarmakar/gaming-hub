import EventEmitter from "events";
import { createNotificationWithActions } from "../notification/notification.service.js";
import { createNotification } from "../notification/notification.controller.js";
import { logger } from "../../shared/utils/logger.js";
import { redis } from "../../shared/config/redis.js";
import {
    emitOrgMemberJoined,
    emitOrgMemberLeft,
    emitOrgRoleUpdated,
    emitOrgOwnerTransferred,
    emitOrgUpdated,
    emitOrgDeleted
} from "./organizer.socket.js";
import { emitProfileUpdate } from "../user/user.socket.js";

/**
 * OrganizerEventEmitter handles internal events within the Organizer module.
 * This allows side effects (like notifications and cache invalidation) to be decoupled from the core business logic loops.
 */
class OrganizerEventEmitter extends EventEmitter { }

const organizerEvents = new OrganizerEventEmitter();

// Event Types
export const ORG_EVENT_TYPES = {
    ORG_CREATED: "org:created",
    ORG_UPDATED: "org:updated",
    ORG_DELETED: "org:deleted",
    MEMBER_JOINED: "org:member:joined",
    MEMBER_LEFT: "org:member:left",
    MEMBER_REMOVED: "org:member:removed", // e.g staff removed by owner
    ROLE_UPDATED: "org:role:updated",
    OWNER_TRANSFERRED: "org:owner:transferred"
};

let isInitialized = false;

/**
 * Initialize listeners for Organizer events.
 */
export const initOrganizerListeners = () => {
    if (isInitialized) return;
    isInitialized = true;

    // Cache invalidation helper
    const invalidateCache = async (keys) => {
        try {
            if (keys.length > 0) {
                const pipeline = redis.pipeline();
                keys.forEach(key => pipeline.del(key));
                await pipeline.exec();
            }
        } catch (error) {
            logger.error("Failed to invalidate cache from Organizer event:", error);
        }
    };

    // 1. Organization Created
    organizerEvents.on(ORG_EVENT_TYPES.ORG_CREATED, async ({ org, ownerId }) => {
        logger.info(`Organization created: ${org._id} by ${ownerId}`);
        // Profile caches are explicitly handled in the controller before cookie generation
        // But we could emit external analytics here
    });

    // 2. Organization Updated
    organizerEvents.on(ORG_EVENT_TYPES.ORG_UPDATED, async ({ orgId }) => {
        logger.info(`Organization updated: ${orgId}`);
        await invalidateCache([`org_details:${orgId}`]);
        emitOrgUpdated(orgId);
    });

    // 3. Organization Deleted
    organizerEvents.on(ORG_EVENT_TYPES.ORG_DELETED, async ({ orgId, ownerId, memberIds = [] }) => {
        logger.info(`Organization deleted: ${orgId}`);

        // Invalidate caches for all affected members
        const cacheKeys = [`org_details:${orgId}`, ...memberIds.map(id => `user_profile:${id}`)];
        await invalidateCache(cacheKeys);

        emitOrgDeleted(orgId);

        // Emit profile update for every member so their UI refreshes
        for (const memberId of memberIds) {
            emitProfileUpdate(memberId, { orgId, action: "org_deleted" });
        }
    });

    // 4. Member Joined (Staff added or accepted proxy)
    organizerEvents.on(ORG_EVENT_TYPES.MEMBER_JOINED, async ({ org, memberIds, handledById = null }) => {
        logger.info(`Members joined Organization: ${org._id} (${memberIds.length} members)`);

        // Cache Invalidation
        const cacheKeys = memberIds.flatMap(uid => [
            `user_profile:${uid}`,
            `chat_access:organizer:${uid}:${org._id}`,
            `chat_role:organizer:${uid}:${org._id}`
        ]);
        cacheKeys.push(`org_details:${org._id}`);
        await invalidateCache(cacheKeys);

        // Notifications
        for (const memberId of memberIds) {
            try {
                // Determine sender (handledBy for join request tracking, fallback to orgOwner)
                const senderId = handledById || org.ownerId;

                await createNotification({
                    recipient: memberId,
                    sender: senderId,
                    type: "ORG_JOIN_SUCCESS",
                    content: { title: "Organization Joined", message: `You have successfully joined the organization ${org.name}.` },
                    relatedData: { orgId: org._id },
                });
            } catch (error) {
                logger.error(`Notification failed for ORG_JOIN_SUCCESS event for user ${memberId}:`, error);
            }
        }

        // Socket Emission
        emitOrgMemberJoined(org._id, memberIds);
    });

    // 5. Member Removed (By an Admin/Owner)
    organizerEvents.on(ORG_EVENT_TYPES.MEMBER_REMOVED, async ({ org, memberId }) => {
        logger.info(`Member removed from Organization: ${org._id} (${memberId})`);

        // Cache Invalidation
        await invalidateCache([
            `user_profile:${memberId}`,
            `org_details:${org._id}`,
            `chat_access:organizer:${memberId}:${org._id}`,
            `chat_role:organizer:${memberId}:${org._id}`
        ]);
        emitOrgMemberLeft(org._id, memberId);
        emitProfileUpdate(memberId, { orgId: org._id, action: "left" });

        // Notifications
        try {
            await createNotificationWithActions({
                recipient: memberId,
                sender: org.ownerId, // Typically the owner executing the kick
                type: "ORG_MEMBER_REMOVED",
                title: "Removed from Organization",
                message: `You have been removed from the organization ${org.name}.`,
                relatedData: { orgId: org._id },
            });
        } catch (error) {
            logger.error("Notification failed for ORG_MEMBER_REMOVED event:", error);
        }
    });

    // 6. Member Left (Voluntarily)
    organizerEvents.on(ORG_EVENT_TYPES.MEMBER_LEFT, async ({ org, memberId }) => {
        logger.info(`Member voluntarily left Organization: ${org._id} (${memberId})`);

        // Cache Invalidation
        await invalidateCache([
            `user_profile:${memberId}`,
            `org_details:${org._id}`,
            `chat_access:organizer:${memberId}:${org._id}`,
            `chat_role:organizer:${memberId}:${org._id}`
        ]);
        emitOrgMemberLeft(org._id, memberId);
        emitProfileUpdate(memberId, { orgId: org._id, action: "left" });
    });

    // 7. Role Updated
    organizerEvents.on(ORG_EVENT_TYPES.ROLE_UPDATED, async ({ org, memberId, newRole }) => {
        logger.info(`Role updated in Organization: ${org._id} (${memberId} -> ${newRole})`);

        // Cache Invalidation
        await invalidateCache([
            `user_profile:${memberId}`,
            `org_details:${org._id}`,
            `chat_role:organizer:${memberId}:${org._id}`
        ]);
        emitOrgRoleUpdated(org._id, memberId, newRole);

        // Notifications
        try {
            await createNotificationWithActions({
                recipient: memberId,
                sender: org.ownerId, // Assume owner changed it
                type: "ORG_ROLE_UPDATE",
                title: "Role Updated",
                message: `Your role in organization ${org.name} has been updated to ${(newRole || '').replace('org:', '')}.`,
                relatedData: { orgId: org._id },
            });

            // Emit profile update so the user's menu/permissions refresh
            emitProfileUpdate(memberId, { orgId: org._id, action: "role_updated", newRole });
        } catch (error) {
            logger.error("Notification failed for ORG_ROLE_UPDATE event:", error);
        }
    });

    // 8. Ownership Transferred
    organizerEvents.on(ORG_EVENT_TYPES.OWNER_TRANSFERRED, async ({ org, newOwnerId, oldOwnerId }) => {
        logger.info(`Ownership transferred for Organization: ${org._id} (From ${oldOwnerId} To ${newOwnerId})`);

        // Cache Invalidation
        await invalidateCache([`user_profile:${newOwnerId}`, `user_profile:${oldOwnerId}`, `org_details:${org._id}`]);
        emitOrgOwnerTransferred(org._id, newOwnerId, oldOwnerId);

        // Notifications
        try {
            // Notify New Owner
            await createNotificationWithActions({
                recipient: newOwnerId,
                sender: oldOwnerId,
                type: "ORG_OWNERSHIP_TRANSFERRED",
                title: "Ownership Transferred",
                message: `You are now the Owner of the organization ${org.name}.`,
                relatedData: { orgId: org._id },
            });

            // Emit profile updates so both users refresh their roles/menu
            emitProfileUpdate(newOwnerId, { orgId: org._id, action: "ownership_received" });
            emitProfileUpdate(oldOwnerId, { orgId: org._id, action: "ownership_transferred" });
        } catch (error) {
            logger.error("Notification failed for ORG_OWNERSHIP_TRANSFERRED event:", error);
        }
    });

};

export default organizerEvents;
