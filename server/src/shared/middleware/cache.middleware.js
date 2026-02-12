import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";

// In-memory L1 Cache
const l1Cache = new Map();
const L1_TTL = 30 * 1000; // 30 seconds

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
        const key = `__express__${req.originalUrl || req.url}`;
        const now = Date.now();

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
            const responseData = typeof cachedBody === 'string' ? JSON.parse(cachedBody) : cachedBody;

            // Populating L1 Cache for subsequent hits
            l1Cache.set(key, { data: responseData, timestamp: now });

            return res.json(responseData);
        } else {
            logger.info(`>>> [CACHE MISS] ${key}`);
            // Intercept res.json to cache the response body
            res.sendResponse = res.json;
            res.json = (body) => {
                if (res.statusCode === 200) {
                    // Update L1
                    l1Cache.set(key, { data: body, timestamp: Date.now() });

                    // Update L2 (Redis)
                    redis.set(key, JSON.stringify(body), { ex: duration })
                        .catch(err => logger.error("Redis cache set error:", err));
                }
                res.sendResponse(body);
            };
            next();
        }
    } catch (error) {
        logger.error("Cache middleware error:", error);
        next(); // Proceed without caching if Redis fails
    }
};
