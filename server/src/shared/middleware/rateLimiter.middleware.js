import { redis } from "../config/redis.js";
import { CustomError } from "../utils/CustomError.js";
import { logger } from "../utils/logger.js";

// In-memory L1 cache for rate limits to reduce Redis pressure
const rlMemoryCache = new Map();
const RL_MEM_TTL = 2000; // 2 seconds
const MAX_MEM_CACHE_SIZE = 1000; // Prevent memory leak

export const rateLimiter =
  ({ limit = 10, timer = 60, key = "global" }) =>
    async (req, res, next) => {
      try {
        // Robust IP extraction to prevent spoofing
        // Trust proxy should be enabled in app.js for req.ip to be correct behind proxy
        const clientIp = req.ip || req.socket.remoteAddress;

        const fullKey = `rate_limit:${key}:${clientIp}`;
        const now = Date.now();

        // 1. Check memory cache first (L1)
        const memEntry = rlMemoryCache.get(fullKey);
        if (memEntry && (now - memEntry.timestamp < RL_MEM_TTL)) {
          if (memEntry.blocked) {
            return next(
              new CustomError(
                `Too many requests! Try again later`,
                429
              )
            );
          }
        }

        // 2. Redis Check (L2)
        const p = redis.pipeline();
        p.incr(fullKey);
        p.ttl(fullKey);

        const startTime = performance.now();

        const results = await Promise.race([
          p.exec(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 1000))
        ]);
        const endTime = performance.now();

        if (process.env.NODE_ENV !== "test") {
          logger.debug(`>>> [RATE LIMITER REDIS] ${key}: ${(endTime - startTime).toFixed(2)}ms`);
        }

        // @upstash/redis results are [res, res]
        const [requestCount, ttl] = results;

        // If newly created key (TTL will be -1), set expiration
        if (ttl === -1) {
          await redis.expire(fullKey, timer);
        }

        // 3. Update memory cache (L1)
        if (rlMemoryCache.size >= MAX_MEM_CACHE_SIZE) {
          rlMemoryCache.clear(); // Simple bounding
        }

        rlMemoryCache.set(fullKey, {
          blocked: requestCount > limit,
          timestamp: now
        });

        if (requestCount > limit) {
          const timeRemaining = ttl > 0 ? ttl : timer;
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
