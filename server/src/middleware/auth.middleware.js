import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError.js";
import { TryCatchHandler } from "./error.middleware.js";
import { redis } from "../config/redisClient.js";

export const isAuthenticated = TryCatchHandler(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  const accessToken =
    req.cookies.accessToken ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!accessToken)
    return next(new CustomError("Unauthorized: No token provided", 401));

  const isBlacklisted = await redis.get(`blacklist_token:${accessToken}`);
  if (isBlacklisted)
    return next(new CustomError("Token blacklisted! Please login again", 401));

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
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

export const isAdmin = () => {};

export const isSuperAdmin = () => {};
