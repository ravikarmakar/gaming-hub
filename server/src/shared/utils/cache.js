import { redis } from "../config/redis.js";
import { logger } from "./logger.js";

/**
 * Resilient cache invalidation with retry logic and fallback
 * Addresses Risk: Stale Cache from redis.del failures
 * 
 * @param {string|string[]} keys - Key or keys to invalidate
 * @param {Object} options - Invalidation options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.retryDelay - Initial delay between retries in ms (default: 100)
 */
export const invalidateCacheWithRetry = async (keys, options = {}) => {
    const { maxRetries = 3, retryDelay = 100 } = options;
    const keysArray = Array.isArray(keys) ? keys : [keys];

    if (keysArray.length === 0) return true;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (keysArray.length === 1) {
                await redis.del(keysArray[0]);
            } else {
                // Use pipeline for multiple keys
                const pipeline = redis.pipeline();
                keysArray.forEach(key => pipeline.del(key));
                await pipeline.exec();
            }

            if (attempt > 1) {
                logger.info(`Cache invalidation succeeded on attempt ${attempt} for keys: ${keysArray.join(', ')}`);
            }
            return true;
        } catch (error) {
            logger.error(`Cache invalidation attempt ${attempt}/${maxRetries} failed for keys: ${keysArray.join(', ')}`, error);

            if (attempt === maxRetries) {
                // Final fallback: Set very short TTL (1 second) to force near-immediate expiration
                logger.warn(`All cache deletion attempts failed. Setting 1-second TTL as fallback for keys: ${keysArray.join(', ')}`);
                try {
                    const pipeline = redis.pipeline();
                    keysArray.forEach(key => pipeline.expire(key, 1));
                    await pipeline.exec();
                } catch (fallbackError) {
                    logger.error('Fallback TTL update also failed:', fallbackError);
                }
                return false;
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
    }
    return false;
};
