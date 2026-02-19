import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError.js";
import { TryCatchHandler } from "./error.middleware.js";
import { redis } from "../config/redis.js";
import User from "../../modules/user/user.model.js";
import { logger } from "../utils/logger.js";
import { AUTH_ERRORS } from "../constants/errorCodes.js";

// L1 Cache: Map<accessToken, expiryTimestamp>
// Stores tokens that are KNOWN to be valid (not blacklisted) for a short time
const blacklistCache = new Map();
const BLACKLIST_L1_TTL = 30 * 1000; // 30 seconds

// Cleanup L1 cache periodically (every 1 min)
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of blacklistCache.entries()) {
    if (now > expiry) {
      blacklistCache.delete(token);
    }
  }
}, 60 * 1000);

export const isAuthenticated = TryCatchHandler(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  const accessToken =
    req.cookies.accessToken ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!accessToken)
    return next(new CustomError("Unauthorized: No token provided", 401, AUTH_ERRORS.AUTH_TOKEN_REQUIRED));

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // --- Blacklist Check (L1 cache skips Redis blacklist check only) ---
    const l1Expiry = blacklistCache.get(accessToken);
    const l1Hit = l1Expiry && l1Expiry > Date.now();

    if (!l1Hit) {
      // L1 cache miss — check Redis for blacklist AND fetch profile in one roundtrip
      const p = redis.pipeline();
      p.get(`blacklist_token:${accessToken}`);
      p.get(`user_profile:${decoded.userId}`);

      let isBlacklisted = null;
      let cachedProfile = null;

      try {
        const results = await Promise.race([
          p.exec(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 1000))
        ]);

        // @upstash/redis results are [res, res]
        isBlacklisted = results[0];
        cachedProfile = results[1];
      } catch (redisError) {
        logger.error(`>>> [AUTH] Redis check failed: ${redisError.message}`);
        return next(new CustomError("Authentication service unavailable. Please try again.", 503, AUTH_ERRORS.AUTH_SERVICE_UNAVAILABLE));
      }

      if (isBlacklisted)
        return next(new CustomError("Token blacklisted! Please login again", 401, AUTH_ERRORS.AUTH_TOKEN_BLACKLISTED));

      // Token is valid (not blacklisted). Add to L1 cache.
      blacklistCache.set(accessToken, Date.now() + BLACKLIST_L1_TTL);

      // Parse and attach profile
      let parsedProfile = null;
      if (cachedProfile) {
        try {
          parsedProfile = typeof cachedProfile === "string" ? JSON.parse(cachedProfile) : cachedProfile;
        } catch (e) {
          logger.error(`>>> [AUTH] Profile parse error: ${e.message}`);
        }
      }

      req.user = {
        _id: decoded.userId,
        userId: decoded.userId,
        roles: decoded.roles,
        cachedProfile: parsedProfile,
      };
    } else {
      // L1 blacklist cache hit — skip blacklist check, but STILL fetch fresh profile from Redis
      let cachedProfile = null;
      try {
        const rawProfile = await Promise.race([
          redis.get(`user_profile:${decoded.userId}`),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 1000))
        ]);
        if (rawProfile) {
          cachedProfile = typeof rawProfile === "string" ? JSON.parse(rawProfile) : rawProfile;
        }
      } catch (redisError) {
        // Non-fatal: fall back to JWT roles if Redis profile fetch fails
        logger.warn(`[AUTH] Redis profile fetch failed on L1 hit: ${redisError.message}`);
      }

      req.user = {
        _id: decoded.userId,
        userId: decoded.userId,
        roles: decoded.roles,
        cachedProfile: cachedProfile,
      };
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new CustomError("Unauthorized: Token has expired", 401, AUTH_ERRORS.AUTH_TOKEN_EXPIRED));
    } else if (error.name === "JsonWebTokenError") {
      return next(new CustomError("Unauthorized: Invalid token", 401, AUTH_ERRORS.AUTH_INVALID_TOKEN));
    } else {
      return next(new CustomError("Unauthorized access", 401, AUTH_ERRORS.AUTH_UNAUTHORIZED));
    }
  }
});

// Optional authentication middleware that identifies the user if a token is present
// but does not throw an error if it's missing or invalid.
export const optionalAuthenticate = TryCatchHandler(async (req, res, next) => {
  const accessToken =
    req.cookies.accessToken ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!accessToken) return next();

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Check if blacklisted
    const isBlacklisted = await redis.get(`blacklist_token:${accessToken}`);
    if (isBlacklisted) return next();

    req.user = {
      _id: decoded.userId,
      userId: decoded.userId,
      roles: decoded.roles,
    };
    next();
  } catch (error) {
    // Silently continue for optional auth
    next();
  }
});

export const isVerified = TryCatchHandler(async (req, res, next) => {
  // Guard: Ensure req.user exists (should be set by isAuthenticated middleware)
  if (!req.user || !req.user.userId) {
    return next(new CustomError("Unauthorized: User not authenticated", 401, AUTH_ERRORS.AUTH_UNAUTHORIZED));
  }

  const userId = req.user.userId;
  const cacheKey = `user_profile:${userId}`;

  let user = null;
  try {
    user = await redis.get(cacheKey);
    if (user) {
      user = typeof user === "string" ? JSON.parse(user) : user;
    }
  } catch (redisError) {
    logger.error("Redis isVerified error:", redisError);
    user = null; // Ensure fallback
  }

  if (!user) {
    user = await User.findById(userId).lean();
    if (user) {
      try {
        await redis.set(cacheKey, JSON.stringify(user), { ex: 60 });
      } catch (saveCacheError) {
        logger.error("Redis setex error in isVerified:", saveCacheError);
      }
      // Attach fresh profile for downstream RBAC checks
      req.user.cachedProfile = user;
    }
  }

  if (!user) return next(new CustomError("User not found", 404, AUTH_ERRORS.AUTH_USER_NOT_FOUND));

  if (!user.isAccountVerified) {
    return next(
      new CustomError(
        "Forbidden: Your account is not verified. Please verify your email.",
        403,
        AUTH_ERRORS.AUTH_ACCOUNT_NOT_VERIFIED
      )
    );
  }

  logger.debug(">>> [isVerified] Account is verified. Next.");
  next();
});
