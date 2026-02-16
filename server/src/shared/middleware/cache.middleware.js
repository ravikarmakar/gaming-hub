import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";
import { LRUCache } from "lru-cache";

// In-memory L1 Cache with proper LRU eviction
const l1Cache = new LRUCache({
    max: 10_000,           // 10k entries (up from 100)
    ttl: 30 * 1000,        // 30 seconds auto-expiry
});

/**
 * Caching middleware using Redis
 * @param {number} duration - Cache expiration time in seconds
 */
export const cache = (duration) => async (req, res, next) => {
    // Skip caching in test environment
    if (process.env.NODE_ENV === "test") {
        return next();
    }

    try {
        // Include HTTP method and User ID (if authenticated) in cache key
        const userId = req.user ? req.user._id : "anon";
        const key = `__express__${req.method}:${req.originalUrl || req.url}:${userId}`;

        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        // 1. Check L1 Cache (Memory) — LRU handles TTL automatically
        const cachedL1 = l1Cache.get(key);
        if (cachedL1 !== undefined) {
            logger.info(`>>> [L1 CACHE HIT] ${key}`);
            // Return a deep copy to prevent mutation of the cached object
            return res.json(JSON.parse(JSON.stringify(cachedL1)));
        }

        // 2. Check L2 Cache (Redis)
        const startTime = performance.now();
        const cachedBody = await Promise.race([
            redis.get(key),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 1000))
        ]);
        const endTime = performance.now();

        if (process.env.NODE_ENV !== "test") {
            logger.info(`>>> [L2 REDIS GET] ${key}: ${(endTime - startTime).toFixed(2)}ms`);
        }

        if (cachedBody) {
            logger.info(`>>> [L2 CACHE HIT] ${key}`);

            // Error handling for corrupted cache data
            try {
                const responseData = typeof cachedBody === 'string' ? JSON.parse(cachedBody) : cachedBody;

                // L1 Cache: Deep copy to prevent reference mutation
                // LRU handles eviction and TTL automatically
                l1Cache.set(key, JSON.parse(JSON.stringify(responseData)));

                return res.json(responseData);
            } catch (parseError) {
                logger.error(`Corrupted cache data for key ${key}, invalidating...`, parseError);
                // Invalidate corrupted cache entry
                await redis.del(key).catch(err => logger.error("Failed to delete corrupted cache:", err));
                // Fall through to cache miss handling
            }
        }

        logger.info(`>>> [CACHE MISS] ${key}`);
        // Intercept res.json to cache the response body
        res.sendResponse = res.json;
        res.json = (body) => {
            if (res.statusCode === 200) {
                try {
                    // Update L1 — LRU handles eviction automatically
                    l1Cache.set(key, body);

                    // Update L2 (Redis) - Handle circular references or serialization errors safely
                    const stringifiedBody = JSON.stringify(body);
                    redis.set(key, stringifiedBody, { ex: duration })
                        .catch(err => logger.error("Redis cache set error:", err));
                } catch (serializationError) {
                    logger.error(`Failed to cache response for key ${key}:`, serializationError);
                }
            }
            return res.sendResponse(body); // Preserve return value
        };
        next();
    } catch (error) {
        logger.error("Cache middleware error:", error);
        next(); // Proceed without caching if Redis fails
    }
};
