import { redis } from "../config/redis.js";
import { CustomError } from "../utils/CustomError.js";
import { logger } from "../utils/logger.js";

// In-memory L1 cache for rate limits to reduce Redis pressure
const rlMemoryCache = new Map();
const RL_MEM_TTL = 2000; // 2 seconds

export const rateLimiter =
  ({ limit = 10, timer = 60, key = "global" }) =>
    async (req, res, next) => {
      try {
        const clientIp =
          req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        const fullKey = `rate_limit:${key}:${clientIp}`;
        const now = Date.now();

        // Check memory cache first
        const memEntry = rlMemoryCache.get(fullKey);
        if (memEntry && (now - memEntry.timestamp < RL_MEM_TTL)) {
          if (memEntry.count > limit) {
            return next(new CustomError(`Too many requests! Try again later`, 429));
          }
          // Increment in memory too
          memEntry.count++;
        }

        const p = redis.pipeline();
        p.incr(fullKey);
        p.expire(fullKey, timer);

        const startTime = performance.now();
        const results = await Promise.race([
          p.exec(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 500))
        ]);
        const endTime = performance.now();

        if (process.env.NODE_ENV !== "test") {
          logger.debug(`>>> [RATE LIMITER REDIS] ${key}: ${(endTime - startTime).toFixed(2)}ms`);
        }

        const [requestCount] = results;

        // Update memory cache
        rlMemoryCache.set(fullKey, { count: requestCount, timestamp: now });

        if (requestCount > limit) {
          const timeRemaining = await redis.ttl(fullKey).catch(() => 0);
          return next(
            new CustomError(
              `Too many requests! Try again in ${timeRemaining || 'a few'} seconds`,
              429
            )
          );
        }

        next();
      } catch (error) {
        logger.error(`Rate limiter error [${key}] (falling back):`, error.message);
        next(); // Proceed even if rate limiter fails
      }
    };
