import jwt from "jsonwebtoken";
import axios from "axios";
import qs from "qs";
import { redis } from "../config/redisClient.js";

import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import {
  generateTokens,
  setCookies,
  storeRefreshToken,
} from "../utils/generateTokens.js";
import { oauth2Client } from "../config/google.config.js";
import { discordOAuthConfig } from "../config/discord.config.js";
import { transporter } from "../config/nodemailer.config.js";
import { generateOTP, sendVerificationEmail } from "../utils/otp.js";

export const register = TryCatchHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const isExistingUsername = await User.findOne({ username });
  if (isExistingUsername)
    return next(
      new CustomError("Username already exists. Please choose another.", 409),
    );

  const isExistingEmail = await User.findOne({ email });
  if (isExistingEmail)
    return next(new CustomError("Email already exists. Try logging in.", 409));

  const user = await User.create({ username, email, password });

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

  // store refresh token in redis
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  // Generate and save verification OTP
  const otp = generateOTP();
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save();

  // Send Verification Email (non-blocking for faster response)
  sendVerificationEmail(email, otp).catch((err) =>
    console.error("Failed to send verification email:", err),
  );

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    accessToken,
    user: user.toObject(),
  });
});

export const login = TryCatchHandler(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new CustomError("All fields are required", 400));
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  }).select("+password +verifyOtpExpireAt");

  if (!user) {
    return next(new CustomError("Invalid credentials", 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new CustomError("Invalid credentials", 401));
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

  // store only refresh token in redis
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  // remove password before sending user in response
  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user: userObj,
  });
});

export const logout = TryCatchHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  // Batch Redis operations for better performance
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
        p.setex(`blacklist_token:${accessToken}`, 15 * 60, "true");
      }

      await p.exec();
    } catch (error) {
      // Don't throw error here, just proceed to clear cookies
      console.warn("Redis cleanup failed during logout:", error.message);
    }
  }

  // Clear cookies safely
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

  const decoded = jwt.verify(
    refreshTokenCookie,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

  if (storedToken !== refreshTokenCookie)
    return next(new CustomError("Invalid refresh token", 401));

  if (decoded) {
    await redis.del(`refresh_token:${decoded.userId}`);
  }

  const user = await User.findById(decoded.userId);
  if (!user) return next(new CustomError("User not found", 404));

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

  // store refreshToken token in redis
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  // remove password before sending user in response
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

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const { data } = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`,
  );

  const { email, name, picture } = data;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      username: name,
      email,
      avatar: picture,
      oauthProvider: "google",
      isAccountVerified: true,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    success: true,
    message: "User logged in successfully",
    user: userObj,
  });
});

export const discordLogin = TryCatchHandler(async (req, res, next) => {
  const { code } = req.query;

  try {
    const data = {
      client_id: discordOAuthConfig.client_id,
      client_secret: discordOAuthConfig.client_secret,
      grant_type: "authorization_code",
      code,
      redirect_uri: discordOAuthConfig.redirect_uri,
    };

    // Get access token
    const tokenRes = await axios.post(
      discordOAuthConfig.token_url,
      qs.stringify(data),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const access_token = tokenRes.data.access_token;

    // Get user info (with email)
    const userRes = await axios.get(discordOAuthConfig.user_url, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { username, avatar, email, verified } = userRes.data;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "No email found with this Discord account.",
      });
    }

    // Check if email is verified
    if (!verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your Discord email.",
      });
    }

    // Save or find user in DB by email
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username,
        avatar,
        email,
        oauthProvider: "discord",
        isAccountVerified: true,
      });
    }

    // Generate JWT token
    const { accessToken, refreshToken } = generateTokens(user._id, user.roles);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    console.error("Discord Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Login failed with Discord",
      error: error.message,
    });
  }
});

export const sendVerifyOtp = TryCatchHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user) return next(new CustomError("User not found", 404));
  if (user.isAccountVerified) {
    return res
      .status(200)
      .json({ success: false, message: "Account already verified" });
  }
  // Generate and save verification OTP
  const otp = generateOTP();

  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 mins = 600000 ms

  await user.save();
  await redis.del(`user_profile:${req.user.userId}`);

  // Send Verification Email (non-blocking for faster response)
  sendVerificationEmail(user.email, otp).catch((err) =>
    console.error("Failed to send verification email:", err),
  );

  res.status(200).json({
    success: true,
    message: "Verification OTP sent on Email",
    user: user.toObject(),
  });
});

export const verifyEmail = TryCatchHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const { otp } = req.body;

  const cacheKey = `user_profile:${userId}`;
  if (!otp)
    return next(
      new CustomError("Please provide the OTP sent to your email.", 400),
    );

  const user = await User.findById(userId).select(
    "+verifyOtp +verifyOtpExpireAt",
  );
  if (!user) return next(new CustomError("User not found", 404));

  await redis.del(cacheKey);

  if (user.verifyOtp !== otp)
    return res.status(400).json({ success: false, message: "Invalid OTP" });

  if (user.verifyOtpExpireAt < Date.now())
    return res.status(400).json({ success: false, message: "OTP has expired" });

  user.isAccountVerified = true;
  user.verifyOtp = "";
  user.verifyOtpExpireAt = 0;

  await user.save();

  // Update cache for 1 minute (adjust time as needed)
  await redis.setex(cacheKey, 60, JSON.stringify(user));

  res.status(200).json({
    success: true,
    message: "Your account was verified successfully",
    user: user.toObject(),
  });
});

export const getProfile = TryCatchHandler(async (req, res, next) => {
  const userId = req.user.userId;
  if (req.user.cachedProfile) {
    return res.status(200).json({
      success: true,
      user: req.user.cachedProfile,
      cached: true,
    });
  }

  const cacheKey = `user_profile:${userId}`;
  let cachedData = null;

  try {
    cachedData = await redis.get(cacheKey);
  } catch (err) {
    console.error("Redis getProfile error:", err);
  }

  if (cachedData) {
    try {
      const user =
        typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
      return res.status(200).json({
        success: true,
        user,
        cached: true,
      });
    } catch (parseError) {
      console.error("Redis parse error in getProfile:", parseError);
    }
  }

  const user = await User.findById(userId).select("+verifyOtpExpireAt");
  if (!user) return next(new CustomError("User not found", 404));

  try {
    await redis.setex(cacheKey, 60, JSON.stringify(user));
  } catch (setCacheError) {
    console.error("Redis setex error in getProfile:", setCacheError);
  }

  return res.status(200).json({ success: true, user });
});

export const sendResetPasswordOtp = TryCatchHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new CustomError("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new CustomError("User not found", 404));

  if (!user.isAccountVerified)
    return next(new CustomError("You first need to verify your email", 401));

  if (user.oauthProvider)
    return next(new CustomError("This email not valid to reset password", 400));

  // Generate otp
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  user.resetOtp = otp;
  user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 mins = 600000 ms

  await user.save();

  // Mail content
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Password Reset OTP - Gaming Hub",
    text: `Hello ${
      user.username || "User"
    },\n\nWe received a request to reset the password for your Gaming Hub account.\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease use this OTP to reset your password. This OTP is valid for only 10 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nRegards,\nGaming Hub Team`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    success: true,
    message:
      "Reset password OTP has been sent to your email address. It will expire in 10 minutes.",
  });
});

export const resetPassword = TryCatchHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  // Input validations
  if (!email || !otp || !newPassword)
    return next(
      new CustomError("Email, OTP, and new password are required", 400),
    );

  const user = await User.findOne({ email }).select(
    "+password +resetOtp +resetOtpExpireAt",
  );

  if (!user) return next(new CustomError("User not found", 404));

  // Checking if OTP matches and is not expired
  if (
    !user.resetOtp ||
    user.resetOtp !== otp ||
    user.resetOtpExpireAt < Date.now()
  )
    return next(new CustomError("Invalid or expired OTP", 400));

  // Clear OTP fields
  user.password = newPassword;
  user.resetOtp = "";
  user.resetOtpExpireAt = 0;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully. You can now log in.",
  });
});
