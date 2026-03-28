import jwt from "jsonwebtoken";
import crypto from "crypto";
import { logger } from "../../shared/utils/logger.js";
import { redis } from "../../shared/config/redis.js";
import User from "../user/user.model.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import {
  registerUser,
  loginUser,
  handleGoogleLogin,
  handleDiscordLogin,
  sendVerifyOtpService,
  verifyEmailService,
  getUserProfile,
  sendPasswordResetEmail,
  verifyResetOtpService,
  resetUserPassword,
  updateUserProfile,
  deleteUserAccount,
  updateUserSettings,
  generateTokens,
  storeRefreshToken,
  setCookies,
  changePasswordService
} from "./auth.service.js";

/**
 * Helper to ensure consistent user object serialization
 */
const formatUserResponse = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.__v;
  // Ensure sensitive internal fields are removed if they exist
  delete userObj.resetPasswordOtp;
  delete userObj.resetPasswordExpires;
  delete userObj.verificationOtp;
  delete userObj.verificationOtpExpires;
  return userObj;
};

/**
 * Timing-safe string comparison
 */
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  // Hash both to ensure equal length before timingSafeEqual
  const hmacA = crypto.createHmac('sha256', 'static-salt').update(a).digest();
  const hmacB = crypto.createHmac('sha256', 'static-salt').update(b).digest();
  return crypto.timingSafeEqual(hmacA, hmacB);
};

export const register = TryCatchHandler(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    accessToken,
    user: formatUserResponse(user),
  });
});

export const login = TryCatchHandler(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  setCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user: formatUserResponse(user),
  });
});

export const logout = TryCatchHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  if (refreshToken || accessToken) {
    try {
      const p = redis.pipeline();

      // Handle refresh token deletion
      if (refreshToken) {
        try {
          const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
          );
          p.del(`refresh_token:${decoded.userId}`);
        } catch (error) {
          logger.warn("Invalid refresh token during logout:", error.message);
        }
      }

      // Always blacklist access token regardless of refresh token status
      if (accessToken) {
        p.set(`blacklist_token:${accessToken}`, "true", { ex: 15 * 60 });
      }

      await p.exec();
    } catch (error) {
      logger.warn("Redis cleanup failed during logout:", error.message);
    }
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refreshToken = TryCatchHandler(async (req, res, next) => {
  const refreshTokenCookie = req.cookies.refreshToken;

  if (!refreshTokenCookie)
    return next(new CustomError("No refresh token provided", 401, AUTH_ERRORS.AUTH_TOKEN_REQUIRED));

  let decoded;
  try {
    decoded = jwt.verify(refreshTokenCookie, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(new CustomError("Invalid refresh token", 401, AUTH_ERRORS.AUTH_INVALID_TOKEN));
  }

  let storedToken;
  try {
    storedToken = await Promise.race([
      redis.get(`refresh_token:${decoded.userId}`),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 500))
    ]);
  } catch (error) {
    logger.error("Refresh token lookup failed:", error.message);
    return next(new CustomError("Authentication service busy. Please try again.", 503, AUTH_ERRORS.AUTH_SERVICE_UNAVAILABLE));
  }

  // Use timing-safe comparison to prevent timing attacks
  if (!storedToken || !safeCompare(storedToken, refreshTokenCookie)) {
    return next(new CustomError("Invalid refresh token", 401, AUTH_ERRORS.AUTH_INVALID_TOKEN));
  }

  if (decoded) {
    await redis.del(`refresh_token:${decoded.userId}`);
  }

  const user = await User.findById(decoded.userId);
  if (!user) return next(new CustomError("User not found", 404, AUTH_ERRORS.AUTH_USER_NOT_FOUND));

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    message: "Token refreshed successfully",
    accessToken,
    user: formatUserResponse(user),
  });
});

export const googleLogin = TryCatchHandler(async (req, res, next) => {
  const { code } = req.query;
  const { user, accessToken, refreshToken } = await handleGoogleLogin(code);

  setCookies(res, accessToken, refreshToken);

  // Status 200 for consistency with session-based login
  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: formatUserResponse(user),
  });
});

export const discordLogin = TryCatchHandler(async (req, res, next) => {
  const { code } = req.query;
  const { user, accessToken, refreshToken } = await handleDiscordLogin(code);

  setCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    user: formatUserResponse(user),
  });
});

export const sendVerifyOtp = TryCatchHandler(async (req, res, next) => {
  const { user, alreadyVerified } = await sendVerifyOtpService(req.user.userId);

  if (alreadyVerified) {
    return res.status(400).json({
      success: false,
      message: "Account already verified"
    });
  }

  res.status(200).json({
    success: true,
    message: "Verification OTP sent on Email",
    user: formatUserResponse(user),
  });
});

export const verifyEmail = TryCatchHandler(async (req, res, next) => {
  const user = await verifyEmailService(req.user.userId, req.body.otp);

  res.status(200).json({
    success: true,
    message: "Your account was verified successfully",
    user: formatUserResponse(user),
  });
});

export const getProfile = TryCatchHandler(async (req, res, next) => {
  const skipCache = req.query.skipCache === "true";
  const { user, unreadCount, cached } = await getUserProfile(req.user.userId, req.user.cachedProfile, skipCache);

  // Note: user coming from getUserProfile is already formatted in the service layer usually,
  // but we apply formatUserResponse here to be safe and consistent.
  const response = {
    success: true,
    user: formatUserResponse(user)
  };

  if (unreadCount !== undefined) response.unreadCount = unreadCount;
  if (cached) response.cached = true;

  return res.status(200).json(response);
});

export const sendResetPasswordOtp = TryCatchHandler(async (req, res, next) => {
  const { message } = await sendPasswordResetEmail(req.body.email);

  res.status(200).json({
    success: true,
    message,
  });
});

export const verifyResetPasswordOtp = TryCatchHandler(async (req, res, next) => {
  const { message } = await verifyResetOtpService(req.body.email, req.body.otp);

  res.status(200).json({
    success: true,
    message,
  });
});

export const resetPassword = TryCatchHandler(async (req, res, next) => {
  const { message } = await resetUserPassword(req.body.email, req.body.otp, req.body.newPassword);

  res.status(200).json({
    success: true,
    message,
  });
});

export const updateProfile = TryCatchHandler(async (req, res, next) => {
  // IP address for auto-country detection
  // x-forwarded-for may contain multiple IPs (comma-separated), use the first one
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : req.socket.remoteAddress;

  const user = await updateUserProfile(req.user.userId, req.body, req.files, ip);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: formatUserResponse(user),
  });
});

export const deleteAccount = TryCatchHandler(async (req, res, next) => {
  await deleteUserAccount(req.user.userId);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});

export const updateSettings = TryCatchHandler(async (req, res, next) => {
  const user = await updateUserSettings(req.user.userId, req.body);

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    user: formatUserResponse(user),
  });
});

export const changePassword = TryCatchHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { message } = await changePasswordService(req.user.userId, currentPassword, newPassword);

  // Invalidate all sessions by blacklisting the current access token
  // and potentially revoking refresh tokens (optional policy)
  // For strict security, we should blacklist the current token
  const accessToken = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (accessToken) {
    try {
      await redis.set(`blacklist_token:${accessToken}`, "true", { ex: 15 * 60 });
      // Also revoke refresh token
      await redis.del(`refresh_token:${req.user.userId}`);
    } catch (e) {
      logger.error("Failed to invalidate tokens on password change:", e);
    }
  }

  res.status(200).json({
    success: true,
    message,
  });
});
