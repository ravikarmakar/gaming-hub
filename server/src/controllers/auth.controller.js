import jwt from "jsonwebtoken";
import axios from "axios";
import qs from "qs";
import geoip from "geoip-lite";
import { redis } from "../config/redis.js";

import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import {
  generateTokens,
  storeRefreshToken,
  setCookies,
} from "../services/auth.service.js";
import { syncUserInTeams } from "../services/team.service.js";
import { oauth2Client, discordOAuthConfig } from "../config/oauth.js";
import { transporter } from "../config/mail.js";
import { generateOTP, sendVerificationEmail } from "../services/otp.service.js";
import { uploadOnImageKit, deleteFromImageKit } from "../services/imagekit.service.js";

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
  user.verifyOtpExpireAt = Date.now() + 2 * 60 * 1000; // 2 mins
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

  // Check if user registered via OAuth - cannot use password login
  if (user.oauthProvider) {
    return next(new CustomError(
      `This account uses ${user.oauthProvider} login. Please sign in with ${user.oauthProvider}.`,
      401
    ));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new CustomError("Invalid credentials", 401));
  }

  // Reset OTPs on successful login
  user.verifyOtp = "";
  user.verifyOtpExpireAt = 0;
  user.resetOtp = "";
  user.resetOtpExpireAt = 0;
  await user.save();

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
        p.set(`blacklist_token:${accessToken}`, "true", { ex: 15 * 60 });
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
  if (user) {
    // Existing user - only allow if they originally signed up with Google
    if (!user.oauthProvider) {
      return next(new CustomError("This email is registered with password. Please login with your password.", 400));
    }
    if (user.oauthProvider !== "google") {
      return next(new CustomError(`This email is linked to ${user.oauthProvider}. Please login with ${user.oauthProvider}.`, 400));
    }
  } else {
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

    // Check if user exists and validate oauth provider
    let user = await User.findOne({ email });
    if (user) {
      // Existing user - only allow if they originally signed up with Discord
      if (!user.oauthProvider) {
        return res.status(400).json({
          success: false,
          message: "This email is registered with password. Please login with your password.",
        });
      }
      if (user.oauthProvider !== "discord") {
        return res.status(400).json({
          success: false,
          message: `This email is linked to ${user.oauthProvider}. Please login with ${user.oauthProvider}.`,
        });
      }
    } else {
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
  user.verifyOtpExpireAt = Date.now() + 2 * 60 * 1000; // 2 mins = 120000 ms

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
  await redis.set(cacheKey, JSON.stringify(user), { ex: 60 });

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
    await redis.set(cacheKey, JSON.stringify(user), { ex: 60 });
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
    return next(new CustomError(
      `This account uses ${user.oauthProvider} login and has no password. Please sign in with ${user.oauthProvider}.`,
      400
    ));

  // Generate otp
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  user.resetOtp = otp;
  user.resetOtpExpireAt = Date.now() + 2 * 60 * 1000; // 2 mins = 120000 ms

  await user.save();

  // Mail content
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Password Reset OTP - Gaming Hub",
    text: `Hello ${user.username || "User"
      },\n\nWe received a request to reset the password for your Gaming Hub account.\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease use this OTP to reset your password. This OTP is valid for only 2 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nRegards,\nGaming Hub Team`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    success: true,
    message:
      "Reset password OTP has been sent to your email address. It will expire in 2 minutes.",
  });
});

export const verifyResetPasswordOtp = TryCatchHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new CustomError("Email and OTP are required", 400));
  }

  const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpireAt");

  if (!user) return next(new CustomError("User not found", 404));

  if (
    !user.resetOtp ||
    user.resetOtp !== otp ||
    user.resetOtpExpireAt < Date.now()
  ) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  res.status(200).json({
    success: true,
    message: "OTP verified successfully. You can now reset your password.",
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

export const updateProfile = TryCatchHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const { username, bio, esportsRole, region, country, isLookingForTeam, gameIgn, gameUid, gender, phoneNumber, dob } = req.body;

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  if (username) user.username = username;
  if (bio !== undefined) user.bio = bio;
  if (esportsRole) user.esportsRole = esportsRole;
  if (region) user.region = region;
  if (isLookingForTeam !== undefined) {
    user.isLookingForTeam = String(isLookingForTeam) === 'true';
  }
  if (gameIgn !== undefined) user.gameIgn = gameIgn;
  if (gameUid !== undefined) user.gameUid = gameUid;
  if (gender !== undefined) user.gender = gender;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (dob !== undefined) user.dob = dob;

  if (country) {
    user.country = country;
  } else if (!user.country) {
    // Auto-detect country from IP
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    if (geo) {
      user.country = geo.country;
      user.countryCode = geo.country;
    }
  }

  if (req.files) {
    if (req.files.avatar) {
      const avatarFile = req.files.avatar[0];
      const uploadRes = await uploadOnImageKit(
        avatarFile.path,
        `avatar-${userId}-${Date.now()}`,
        "/users/avatars"
      );
      if (uploadRes) {
        if (user.avatarFileId) await deleteFromImageKit(user.avatarFileId);
        user.avatar = uploadRes.url;
        user.avatarFileId = uploadRes.fileId;
      }
    }

    if (req.files.coverImage) {
      const coverFile = req.files.coverImage[0];
      const uploadRes = await uploadOnImageKit(
        coverFile.path,
        `cover-${userId}-${Date.now()}`,
        "/users/covers"
      );
      if (uploadRes) {
        if (user.coverImageFileId) await deleteFromImageKit(user.coverImageFileId);
        user.coverImage = uploadRes.url;
        user.coverImageFileId = uploadRes.fileId;
      }
    }
  }

  await user.save();
  await redis.del(`user_profile:${userId}`);

  // Sync denormalized data in teams (Scalability Sync)
  syncUserInTeams(userId, {
    username: user.username,
    avatar: user.avatar,
  }).catch((err) => console.error("Denormalization sync failed:", err));

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

export const deleteAccount = TryCatchHandler(async (req, res, next) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  // Cleanup ImageKit asset
  if (user.avatarFileId) {
    await deleteFromImageKit(user.avatarFileId);
  }

  // Handle other related data if necessary (e.g., if he's a captain, what happens to team?)
  // For now, simple soft delete or hard delete. User requested "delete there profile"
  // I'll stick to the project's pattern of soft delete if exists, but here hard delete seems requested for "cost less"
  // Actually, for users, soft delete is common. But let's look at isDeleted in user model.
  // user.model.js has isDeleted: { type: Boolean, default: false }.

  user.isDeleted = true;
  user.username = `deleteduser_${userId}`; // Avoid unique constraint issues
  user.email = `deleted_${userId}@deleted.com`;
  user.avatar = "https://ui-avatars.com/api/?name=deleted&background=777";
  user.avatarFileId = null;

  await user.save();
  await redis.del(`user_profile:${userId}`);

  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});

export const updateSettings = TryCatchHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const { allowChallenges, allowMessages, notifications } = req.body;

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  if (!user.settings) {
    user.settings = {
      allowChallenges: true,
      allowMessages: true,
    };
  }

  if (allowChallenges !== undefined) user.settings.allowChallenges = allowChallenges;
  if (allowMessages !== undefined) user.settings.allowMessages = allowMessages;

  if (notifications) {
    if (!user.settings.notifications) {
      user.settings.notifications = {
        platform: true,
        email: true,
        sms: false,
      };
    }
    if (notifications.platform !== undefined) user.settings.notifications.platform = notifications.platform;
    if (notifications.email !== undefined) user.settings.notifications.email = notifications.email;
    if (notifications.sms !== undefined) user.settings.notifications.sms = notifications.sms;
  }

  await user.save();
  await redis.del(`user_profile:${userId}`);

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    user,
  });
});
