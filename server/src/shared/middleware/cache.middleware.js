import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";

// In-memory L1 Cache with LRU eviction
const l1Cache = new Map();
const L1_TTL = 30 * 1000; // 30 seconds
const L1_MAX_SIZE = 100; // Maximum entries to prevent memory leak

/**
 * Evict oldest entry from L1 cache (LRU)
 */
const evictOldestL1Entry = () => {
    if (l1Cache.size >= L1_MAX_SIZE) {
        const firstKey = l1Cache.keys().next().value;
        l1Cache.delete(firstKey);
    }
};

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
        // Include HTTP method in cache key to differentiate GET/POST/etc
        const key = `__express__${req.method}:${req.originalUrl || req.url}`;
        const now = Date.now();

        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        // 1. Check L1 Cache (Memory)
        const cachedL1 = l1Cache.get(key);
        if (cachedL1 && (now - cachedL1.timestamp < L1_TTL)) {
            logger.info(`>>> [L1 CACHE HIT] ${key}`);
            return res.json(cachedL1.data);
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

                // Evict oldest entry if cache is full
                evictOldestL1Entry();

                // Populating L1 Cache for subsequent hits
                l1Cache.set(key, { data: responseData, timestamp: now });

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
                    // Evict oldest entry if cache is full
                    evictOldestL1Entry();

                    // Update L1
                    l1Cache.set(key, { data: body, timestamp: Date.now() });

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
