import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError.js";
import { generateTokens, storeRefreshToken, setCookies } from "../services/auth.service.js";
import { TryCatchHandler } from "./error.middleware.js";
import { redis } from "../config/redis.js";
import User from "../models/user.model.js";

export const isAuthenticated = TryCatchHandler(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  const accessToken =
    req.cookies.accessToken ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!accessToken)
    return next(new CustomError("Unauthorized: No token provided", 401));

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // PIPELINE: Fetch blacklist AND profile in one roundtrip
    const p = redis.pipeline();
    p.get(`blacklist_token:${accessToken}`);
    p.get(`user_profile:${decoded.userId}`);

    let isBlacklisted = null;
    let cachedProfile = null;

    try {
      const results = await p.exec();
      isBlacklisted = results[0];
      cachedProfile = results[1];
    } catch (redisError) {
      console.error("Redis auth pipeline error:", redisError);
    }

    if (isBlacklisted)
      return next(new CustomError("Token blacklisted! Please login again", 401));

    req.user = {
      _id: decoded.userId,
      userId: decoded.userId,
      roles: decoded.roles,
      cachedProfile: cachedProfile ? (typeof cachedProfile === "string" ? JSON.parse(cachedProfile) : cachedProfile) : null,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new CustomError("Unauthorized: Token has expired", 401));
    } else if (error.name === "JsonWebTokenError") {
      return next(new CustomError("Unauthorized: Invalid token", 401));
    } else {
      return next(new CustomError("Unauthorized access", 401));
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
  const userId = req.user.userId;
  const cacheKey = `user_profile:${userId}`;

  let user = null;
  try {
    user = await redis.get(cacheKey);
    if (user) {
      user = typeof user === "string" ? JSON.parse(user) : user;
    }
  } catch (redisError) {
    console.error("Redis isVerified error:", redisError);
    user = null; // Ensure fallback
  }

  if (!user) {
    user = await User.findById(userId);
    if (user) {
      try {
        await redis.set(cacheKey, JSON.stringify(user), { ex: 60 });
      } catch (saveCacheError) {
        console.error("Redis setex error in isVerified:", saveCacheError);
      }
      // Attach fresh profile for downstream RBAC checks
      req.user.cachedProfile = user;
    }
  }

  if (!user) return next(new CustomError("User not found", 404));

  if (!user.isAccountVerified) {
    return next(
      new CustomError(
        "Forbidden: Your account is not verified. Please verify your email.",
        403
      )
    );
  }

  console.log(">>> [isVerified] Account is verified. Next.");
  next();
});

export const requireRole = (requiredRole, requiredScope = "platform") => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    const hasRole = userRoles.some(
      (r) => r.scope === requiredScope && r.role === requiredRole
    );

    if (!hasRole) {
      return res
        .status(403)
        .json({ message: "Access Denied: Unauthorized role" });
    }

    next();
  };
};

export const checkAnyRole = (rolesArray, scope = "platform") => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    const authorized = rolesArray.some((role) =>
      userRoles.some((r) => r.scope === scope && r.role === role)
    );

    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  };
};
