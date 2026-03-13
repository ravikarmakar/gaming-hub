import Redis from "ioredis";
import { logger } from "../utils/logger.js";

let nativeRedis = null;

/**
 * Initialize a native Redis (ioredis) client for general-purpose caching.
 * Uses REDIS_URL env var. Returns null if not configured.
 * Separate from the Socket.IO pub/sub clients in ioredis.js.
 */
export const initializeNativeRedis = () => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        logger.info("[NativeRedis] REDIS_URL not set — native Redis will not be used.");
        return null;
    }

    try {
        nativeRedis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 200, 3000),
            lazyConnect: false, // Connect immediately
            enableReadyCheck: true,
        });

        nativeRedis.on("error", (err) => {
            logger.error("[NativeRedis] Connection error:", err.message);
        });

        nativeRedis.on("connect", () => {
            logger.info("[NativeRedis] Connected — using native Redis for caching.");
        });

        return nativeRedis;
    } catch (error) {
        logger.error("[NativeRedis] Failed to initialize:", error.message);
        nativeRedis = null;
        return null;
    }
};

/**
 * Get the native Redis client (or null if not available).
 */
export const getNativeRedis = () => nativeRedis;
