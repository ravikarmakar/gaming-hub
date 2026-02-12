import jwt from "jsonwebtoken";
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

export const register = TryCatchHandler(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    accessToken,
    user: user.toObject(),
  });
});

export const login = TryCatchHandler(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  setCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user,
  });
});

export const logout = TryCatchHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  if (refreshToken || accessToken) {
    try {
      const p = redis.pipeline();

      if (refreshToken) {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );
        p.del(`refresh_token:${decoded.userId}`);
      }

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
    return next(new CustomError("No refresh token provided", 401));

  let decoded;
  try {
    decoded = jwt.verify(refreshTokenCookie, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(new CustomError("Invalid refresh token", 401));
  }

  const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

  if (storedToken !== refreshTokenCookie)
    return next(new CustomError("Invalid refresh token", 401));

  if (decoded) {
    await redis.del(`refresh_token:${decoded.userId}`);
  }

  const user = await User.findById(decoded.userId);
  if (!user) return next(new CustomError("User not found", 404));

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  const userObj = user.toObject();
  delete userObj.password;

  res.json({
    success: true,
    message: "Token refreshed successfully",
    accessToken,
    user: userObj,
  });
});

export const googleLogin = TryCatchHandler(async (req, res, next) => {
  const { code } = req.query;
  const { user, accessToken, refreshToken } = await handleGoogleLogin(code);

  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "User logged in successfully",
    user,
  });
});

export const discordLogin = TryCatchHandler(async (req, res, next) => {
  const { code } = req.query;
  const { user, accessToken, refreshToken } = await handleDiscordLogin(code);

  setCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    user,
  });
});

export const sendVerifyOtp = TryCatchHandler(async (req, res, next) => {
  const { user, alreadyVerified } = await sendVerifyOtpService(req.user.userId);

  if (alreadyVerified) {
    return res.status(200).json({ success: false, message: "Account already verified" });
  }

  res.status(200).json({
    success: true,
    message: "Verification OTP sent on Email",
    user: user.toObject(),
  });
});

export const verifyEmail = TryCatchHandler(async (req, res, next) => {
  const user = await verifyEmailService(req.user.userId, req.body.otp);

  res.status(200).json({
    success: true,
    message: "Your account was verified successfully",
    user: user.toObject(),
  });
});

export const getProfile = TryCatchHandler(async (req, res, next) => {
  const { user, unreadCount, cached } = await getUserProfile(req.user.userId, req.user.cachedProfile);

  const response = { success: true, user };
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
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const user = await updateUserProfile(req.user.userId, req.body, req.files, ip);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

export const deleteAccount = TryCatchHandler(async (req, res, next) => {
  await deleteUserAccount(req.user.userId);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

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
    user,
  });
});

export const changePassword = TryCatchHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { message } = await changePasswordService(req.user.userId, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message,
  });
});
