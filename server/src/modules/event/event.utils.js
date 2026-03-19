import { redis } from "../../shared/config/redis.js";
import { logger } from "../../shared/utils/logger.js";
import { clearL1Cache } from "../../shared/middleware/cache.middleware.js";
import mongoose from "mongoose";

/**
 * Clear event related caches
 * Invalidates all-events, org-specific events, and specific event details
 */
export const clearEventCache = async (orgId, eventId = null) => {
  try {
    const prefixes = [
      "__express__GET:/api/v1/events/all-events:",
      `__express__GET:/api/v1/events/org-events/${orgId}:`
    ];

    if (eventId) {
      prefixes.push(`__express__GET:/api/v1/events/event-details/${eventId}:`);
    }

    // 1. Clear L1 Cache (Memory)
    prefixes.forEach(prefix => clearL1Cache(prefix));

    // 2. Clear L2 Cache (Redis)
    await Promise.all(prefixes.map(prefix => redis.delByPrefix(prefix)));
    logger.info(`Cache cleared for org: ${orgId}${eventId ? `, event: ${eventId}` : ""}`);
  } catch (err) {
    logger.error("Error clearing event cache:", err);
  }
};

/**
 * Synchronize a round's status with its entry in the event's roadmaps array
 */
export const syncRoadmapStatus = async (eventId, roundId, status, session = null) => {
  if (!eventId || !roundId || !status) return;

  try {
    const Event = mongoose.model("Event");
    const event = await Event.findById(eventId).session(session);
    if (!event || !event.roadmaps) return;

    let modified = false;
    event.roadmaps.forEach(roadmap => {
      if (Array.isArray(roadmap.data)) {
        roadmap.data.forEach(item => {
          if (item.roundId?.toString() === roundId.toString()) {
            item.status = status;
            modified = true;
          }
        });
      }
    });

    if (modified) {
      event.markModified('roadmaps');
      await event.save({ session });
      logger.info(`Roadmap Status Synced: Round ${roundId} -> ${status} for Event ${eventId}`);

      // Clear event cache to ensure frontend sees updated roadmap
      if (event.orgId) {
        await clearEventCache(event.orgId, eventId);
      }
    }
  } catch (err) {
    logger.error(`Failed to sync roadmap status for round ${roundId}:`, err);
  }
};

/**
 * Escape string for use in regex
 */
export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
