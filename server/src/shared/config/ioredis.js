import Redis from "ioredis";
import { logger } from "../utils/logger.js";

let pubClient = null;
let subClient = null;

/**
 * Initialize native Redis connections for Socket.IO adapter.
 * Requires REDIS_URL env var (e.g., redis://localhost:6379).
 * Falls back gracefully to single-process mode if not configured.
 */
export const initializeIORedis = async () => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        const msg = "[IORedis] REDIS_URL not set. Socket.IO will run in single-process mode. " +
            "Set REDIS_URL for horizontal scaling (e.g., redis://localhost:6379).";

        if (process.env.NODE_ENV === "production") {
            logger.error(`CRITICAL: ${msg}`);
            throw new Error("REDIS_URL is required for Socket.IO horizontal scaling in production.");
        }

        logger.warn(msg);
        return { pubClient: null, subClient: null };
    }

    try {
        pubClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 200, 3000),
            lazyConnect: true,
        });

        subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        logger.info("[IORedis] Pub/Sub clients connected for Socket.IO adapter.");
        return { pubClient, subClient };
    } catch (error) {
        logger.error("[IORedis] Failed to connect. Falling back to single-process mode:", error.message);
        // Cleanup failed connections
        if (pubClient) pubClient.disconnect();
        if (subClient) subClient.disconnect();
        pubClient = null;
        subClient = null;
        return { pubClient: null, subClient: null };
    }
};

export const getIORedisClients = () => ({ pubClient, subClient });
