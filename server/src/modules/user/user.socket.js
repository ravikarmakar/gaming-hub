import { emitToUser } from "../../shared/config/socket.config.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * User Socket Event Types
 */
export const USER_EVENTS = {
    PROFILE_UPDATED: "user:profile_updated",
};

/**
 * Emit when a user's profile or global state (like team membership) is updated
 */
export const emitProfileUpdate = (userId, data = {}) => {
    try {
        emitToUser(userId, USER_EVENTS.PROFILE_UPDATED, {
            ...data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Failed to emit profile update event:", error);
    }
};
