import { redis } from "../config/redisClient.js";
import { CustomError } from "../utils/CustomError.js";

export const rateLimiter =
  ({ limit = 10, timer = 60, key = "global" }) =>
    async (req, res, next) => {
      try {
        const clientIp =
          req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        const fullKey = `rate_limit:${key}:${clientIp}`;
        const p = redis.pipeline();
        p.incr(fullKey);
        p.expire(fullKey, timer);
        const [requestCount] = await p.exec();

        if (requestCount > limit) {
          const timeRemaining = await redis.ttl(fullKey);
          return next(
            new CustomError(
              `Too many requests! Try again in ${timeRemaining} seconds`,
              429
            )
          );
        }

        next();
      } catch (error) {
        console.error("Rate limiter error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error in rate limiter",
        });
      }
    };
