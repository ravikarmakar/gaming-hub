import jwt from "jsonwebtoken";
import axios from "axios";
import qs from "qs";
import geoip from "geoip-lite";
import { redis } from "../../shared/config/redis.js";
import User from "../user/user.model.js";
import { Notification } from "../notification/notification.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { oauth2Client, discordOAuthConfig } from "../../shared/config/oauth.js";
import { transporter } from "../../shared/config/mail.js";
import { generateOTP, sendVerificationEmail } from "../../shared/services/otp.service.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { syncUserInTeams } from "../team/team.service.js";
import { logger } from "../../shared/utils/logger.js";

export const generateTokens = (userId, roles) => {
  const accessToken = jwt.sign(
    { userId, roles },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    { userId, roles },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "15d",
    },
  );

  return { accessToken, refreshToken };
};

export const storeRefreshToken = async (userId, refreshToken) => {
  if (!userId || !refreshToken) {
    throw new Error("userId or refreshToken is missing");
  }

  await redis.set(`refresh_token:${userId}`, refreshToken, {
    ex: 15 * 24 * 60 * 60, // 15 days
  });
};

export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  });
};

export const registerUser = async ({ username, email, password }) => {
  const isExistingUsername = await User.findOne({ username });
  if (isExistingUsername) {
    throw new CustomError("Username already exists. Please choose another.", 409);
  }

  const isExistingEmail = await User.findOne({ email });
  if (isExistingEmail) {
    throw new CustomError("Email already exists. Try logging in.", 409);
  }

  const user = await User.create({ username, email, password });

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);
  await storeRefreshToken(user._id, refreshToken);

  // Generate and save verification OTP
  const otp = generateOTP();
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 2 * 60 * 1000; // 2 mins
  await user.save();

  // Send Verification Email (non-blocking)
  sendVerificationEmail(email, otp).catch((err) =>
    logger.error("Failed to send verification email (registration):", err)
  );

  return { user, accessToken, refreshToken };
};

// Helper function to ensure unique username for OAuth users
const ensureUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let suffix = 1;
  while (await User.findOne({ username })) {
    username = `${baseUsername}${suffix}`;
    suffix++;
  }
  return username;
};

// Helper function to sanitize user object
const sanitizeUserObject = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.verifyOtp;
  delete userObj.resetOtp;
  delete userObj.verifyOtpExpireAt;
  delete userObj.resetOtpExpireAt;
  return userObj;
};

export const loginUser = async ({ identifier, password }) => {
  if (!identifier || !password) {
    throw new CustomError("All fields are required", 400);
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  }).select("+password +verifyOtpExpireAt");

  if (!user) {
    throw new CustomError("Invalid credentials", 401);
  }

  if (user.oauthProvider) {
    throw new CustomError(
      `This account uses ${user.oauthProvider} login. Please sign in with ${user.oauthProvider}.`,
      401,
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Reset OTPs on successful login
  user.verifyOtp = "";
  user.verifyOtpExpireAt = 0;
  user.resetOtp = "";
  user.resetOtpExpireAt = 0;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);
  await storeRefreshToken(user._id, refreshToken);

  return { user: sanitizeUserObject(user), accessToken, refreshToken };
};

export const handleGoogleLogin = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const { data } = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`,
  );

  const { email, name, picture } = data;

  let user = await User.findOne({ email });
  if (user) {
    if (!user.oauthProvider) {
      throw new CustomError(
        "This email is registered with password. Please login with your password.",
        400,
      );
    }
    if (user.oauthProvider !== "google") {
      throw new CustomError(
        `This email is linked to ${user.oauthProvider}. Please login with ${user.oauthProvider}.`,
        400,
      );
    }
  } else {
    const uniqueUsername = await ensureUniqueUsername(name);
    user = await User.create({
      username: uniqueUsername,
      email,
      avatar: picture,
      oauthProvider: "google",
      isAccountVerified: true,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);
  await storeRefreshToken(user._id, refreshToken);

  return { user: sanitizeUserObject(user), accessToken, refreshToken };
};

export const handleDiscordLogin = async (code) => {
  const data = {
    client_id: discordOAuthConfig.client_id,
    client_secret: discordOAuthConfig.client_secret,
    grant_type: "authorization_code",
    code,
    redirect_uri: discordOAuthConfig.redirect_uri,
  };

  const tokenRes = await axios.post(
    discordOAuthConfig.token_url,
    qs.stringify(data),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  const access_token = tokenRes.data.access_token;

  const userRes = await axios.get(discordOAuthConfig.user_url, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const { username, avatar, email, verified } = userRes.data;
  if (!email) {
    throw new CustomError("No email found with this Discord account.", 400);
  }

  if (!verified) {
    throw new CustomError("Email not verified. Please verify your Discord email.", 403);
  }

  let user = await User.findOne({ email });
  if (user) {
    if (!user.oauthProvider) {
      throw new CustomError(
        "This email is registered with password. Please login with your password.",
        400,
      );
    }
    if (user.oauthProvider !== "discord") {
      throw new CustomError(
        `This email is linked to ${user.oauthProvider}. Please login with ${user.oauthProvider}.`,
        400,
      );
    }
  } else {
    // Discord avatar construction (updated for discriminator deprecation)
    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${userRes.data.id}/${avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${(BigInt(userRes.data.id) >> 22n) % 6n}.png`;

    const uniqueUsername = await ensureUniqueUsername(username);
    user = await User.create({
      username: uniqueUsername,
      avatar: avatarUrl,
      email,
      oauthProvider: "discord",
      isAccountVerified: true,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);
  await storeRefreshToken(user._id, refreshToken);

  return { user: sanitizeUserObject(user), accessToken, refreshToken };
};

export const sendVerifyOtpService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);
  if (user.isAccountVerified) {
    return { alreadyVerified: true };
  }

  const otp = generateOTP();
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 2 * 60 * 1000;
  await user.save();
  await redis.del(`user_profile:${userId}`);

  sendVerificationEmail(user.email, otp).catch((err) =>
    logger.error("Failed to send verification email:", err)
  );

  return { user, alreadyVerified: false };
};

export const verifyEmailService = async (userId, otp) => {
  const cacheKey = `user_profile:${userId}`;
  if (!otp) throw new CustomError("Please provide the OTP sent to your email.", 400);

  const user = await User.findById(userId).select("+verifyOtp +verifyOtpExpireAt");
  if (!user) throw new CustomError("User not found", 404);

  await redis.del(cacheKey);

  if (user.verifyOtp !== otp) throw new CustomError("Invalid OTP", 400);
  if (user.verifyOtpExpireAt < Date.now()) throw new CustomError("OTP has expired", 400);

  user.isAccountVerified = true;
  user.verifyOtp = "";
  user.verifyOtpExpireAt = 0;
  await user.save();

  await redis.set(cacheKey, JSON.stringify(user), { ex: 60 });
  return user;
};

// In-memory L1 cache for user profiles with LRU eviction
const profileL1Cache = new Map();
const L1_TTL = 30 * 1000; // 30 seconds
const MAX_L1_CACHE_SIZE = 1000;

// Helper to set L1 cache with size limit (LRU eviction)
const setL1Cache = (key, value) => {
  // If at capacity, remove oldest entry (first in Map)
  if (profileL1Cache.size >= MAX_L1_CACHE_SIZE) {
    const firstKey = profileL1Cache.keys().next().value;
    profileL1Cache.delete(firstKey);
  }
  profileL1Cache.set(key, value);
};

// Periodic cleanup of expired L1 cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of profileL1Cache.entries()) {
    if (now - value.timestamp >= L1_TTL) {
      profileL1Cache.delete(key);
    }
  }
}, 60000); // Clean up every minute

export const getUserProfile = async (userId, cachedProfile) => {
  const now = Date.now();
  const l1Key = `profile:${userId}`;

  // 1. Check L1 Cache (Memory)
  const cachedL1 = profileL1Cache.get(l1Key);
  if (cachedL1 && (now - cachedL1.timestamp < L1_TTL)) {
    logger.info(`>>> [L1 PROFILE HIT] ${userId}`);
    return { ...cachedL1.data, cached: true };
  }

  // 2. Check cachedProfile from middleware
  if (cachedProfile) {
    const response = { user: cachedProfile, cached: true };
    // If middleware provided the profile but not the unreadCount, we still need the count
    // but the controller expects unreadCount to be present if possible.
    // However, if we want to BE FAST, we skip unreadCount if it's cached.
    // Let's check if unreadCount is in the cachedProfile or if we should fetch it.
    if (cachedProfile.unreadCount !== undefined) {
      response.unreadCount = cachedProfile.unreadCount;
      setL1Cache(l1Key, { data: response, timestamp: now });
      return response;
    }
  }

  // 3. Check L2 Cache (Redis)
  const cacheKey = `user_profile:${userId}`;
  let cachedData = null;
  try {
    cachedData = await Promise.race([
      redis.get(cacheKey),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 800))
    ]);
  } catch (err) {
    logger.error("Redis profile get error:", err.message);
  }

  if (cachedData) {
    try {
      const user = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
      // Fetch unread count if not in redis (old cache format)
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        status: "unread",
      });
      const response = { user, unreadCount, cached: true };
      setL1Cache(l1Key, { data: response, timestamp: now });
      return response;
    } catch (e) {
      logger.error("JSON parse error for cached user profile:", e);
    }
  }

  // 4. Fetch from Database
  const user = await User.findById(userId).select("+verifyOtpExpireAt");
  if (!user) throw new CustomError("User not found", 404);

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    status: "unread",
  });

  const response = { user: user.toObject(), unreadCount, cached: false };

  // Update Caches
  setL1Cache(l1Key, { data: response, timestamp: now });

  // Store plain object in Redis to avoid [object Object] serialization
  redis.set(cacheKey, JSON.stringify(response.user), { ex: 60 })
    .catch(err => logger.error("Redis set error for user profile:", err));

  return response;
};

export const sendPasswordResetEmail = async (email) => {
  if (!email) throw new CustomError("Email is required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);

  if (!user.isAccountVerified)
    throw new CustomError("You first need to verify your email", 401);

  if (user.oauthProvider)
    throw new CustomError(
      `This account uses ${user.oauthProvider} login and has no password. Please sign in with ${user.oauthProvider}.`,
      400,
    );

  const otp = String(Math.floor(100000 + Math.random() * 900000));

  user.resetOtp = otp;
  user.resetOtpExpireAt = Date.now() + 2 * 60 * 1000;
  await user.save();

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Password Reset OTP - Gaming Hub",
    text: `Hello ${user.username || "User"
      },\n\nWe received a request to reset the password for your Gaming Hub account.\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease use this OTP to reset your password. This OTP is valid for only 2 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nRegards,\nGaming Hub Team`,
  };

  await transporter.sendMail(mailOptions);
  return { message: "Reset password OTP has been sent to your email address. It will expire in 2 minutes." };
};

export const verifyResetOtpService = async (email, otp) => {
  if (!email || !otp) {
    throw new CustomError("Email and OTP are required", 400);
  }

  const user = await User.findOne({ email }).select(
    "+resetOtp +resetOtpExpireAt",
  );

  if (!user) throw new CustomError("User not found", 404);

  if (
    !user.resetOtp ||
    user.resetOtp !== otp ||
    user.resetOtpExpireAt < Date.now()
  ) {
    throw new CustomError("Invalid or expired OTP", 400);
  }

  return { message: "OTP verified successfully. You can now reset your password." };
};

export const resetUserPassword = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword)
    throw new CustomError("Email, OTP, and new password are required", 400);

  const user = await User.findOne({ email }).select(
    "+password +resetOtp +resetOtpExpireAt",
  );

  if (!user) throw new CustomError("User not found", 404);

  if (
    !user.resetOtp ||
    user.resetOtp !== otp ||
    user.resetOtpExpireAt < Date.now()
  )
    throw new CustomError("Invalid or expired OTP", 400);

  user.password = newPassword;
  user.resetOtp = "";
  user.resetOtpExpireAt = 0;

  await user.save();
  return { message: "Password has been reset successfully. You can now log in." };
};

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new CustomError("User not found", 404);

  if (user.oauthProvider) {
    throw new CustomError(
      `This account uses ${user.oauthProvider} login and has no password to change.`,
      400
    );
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new CustomError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();
  return { message: "Password updated successfully" };
};

export const updateUserProfile = async (userId, body, files, ipAddress) => {
  const {
    username,
    bio,
    esportsRole,
    region,
    country,
    isLookingForTeam,
    gameIgn,
    gameUid,
    gender,
    phoneNumber,
    dob,
  } = body;

  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);

  if (username) user.username = username;
  if (bio !== undefined) user.bio = bio;
  if (esportsRole) user.esportsRole = esportsRole;
  if (region) user.region = region;
  if (isLookingForTeam !== undefined) {
    user.isLookingForTeam = String(isLookingForTeam) === "true";
  }
  if (gameIgn !== undefined) user.gameIgn = gameIgn;
  if (gameUid !== undefined) user.gameUid = gameUid;
  if (gender !== undefined) user.gender = gender;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (dob !== undefined) user.dob = dob;

  if (country) {
    user.country = country;
  } else if (!user.country && ipAddress) {
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      user.country = geo.country;
      user.countryCode = geo.country;
    }
  }

  // Handle Image Uploads with Rollback Support
  const uploadedFiles = []; // Track new uploads: { fileId, type }
  const filesToDeleteAfterSave = []; // Track old files to delete ONLY after success

  try {
    if (files) {
      if (files.avatar) {
        const avatarFile = files.avatar[0];
        const uploadRes = await uploadOnImageKit(
          avatarFile.path,
          `avatar-${userId}-${Date.now()}`,
          "/users/avatars",
        );

        if (uploadRes) {
          uploadedFiles.push({ fileId: uploadRes.fileId, type: 'avatar' });

          // Mark old file for deletion later
          if (user.avatarFileId) {
            filesToDeleteAfterSave.push(user.avatarFileId);
          }

          user.avatar = uploadRes.url;
          user.avatarFileId = uploadRes.fileId;
        }
      }

      if (files.coverImage) {
        const coverFile = files.coverImage[0];
        const uploadRes = await uploadOnImageKit(
          coverFile.path,
          `cover-${userId}-${Date.now()}`,
          "/users/covers",
        );

        if (uploadRes) {
          uploadedFiles.push({ fileId: uploadRes.fileId, type: 'cover' });

          // Mark old file for deletion later
          if (user.coverImageFileId) {
            filesToDeleteAfterSave.push(user.coverImageFileId);
          }

          user.coverImage = uploadRes.url;
          user.coverImageFileId = uploadRes.fileId;
        }
      }
    }

    // Attempt to save user changes
    await user.save();

    // If save successful, delete old images (fire and forget)
    if (filesToDeleteAfterSave.length > 0) {
      Promise.allSettled(filesToDeleteAfterSave.map(id => deleteFromImageKit(id)))
        .catch(err => logger.error("Background image cleanup failed:", err));
    }

    await redis.del(`user_profile:${userId}`);

    // Sync denormalized data in teams
    syncUserInTeams(userId, {
      username: user.username,
      avatar: user.avatar,
    }).catch((err) => logger.error("Denormalization sync failed:", err));

    return user;

  } catch (error) {
    // Rollback: Delete newly uploaded images because the operation failed
    if (uploadedFiles.length > 0) {
      logger.info(`Rolling back ${uploadedFiles.length} uploaded images due to update failure...`);
      Promise.allSettled(uploadedFiles.map(f => deleteFromImageKit(f.fileId)))
        .catch(err => logger.error("Rollback cleanup failed:", err));
    }
    throw error;
  }
};

export const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);

  // Delete both avatar and cover image from ImageKit
  const deletePromises = [];
  if (user.avatarFileId) {
    deletePromises.push(deleteFromImageKit(user.avatarFileId));
  }
  if (user.coverImageFileId) {
    deletePromises.push(deleteFromImageKit(user.coverImageFileId));
  }
  if (deletePromises.length > 0) {
    await Promise.allSettled(deletePromises);
  }

  user.isDeleted = true;
  user.username = `deleteduser_${userId}`;
  user.email = `deleted_${userId}@deleted.com`;
  user.avatar = "https://ui-avatars.com/api/?name=deleted&background=777";
  user.avatarFileId = null;
  user.coverImageFileId = null;

  await user.save();
  await redis.del(`user_profile:${userId}`);
  return true;
};

export const updateUserSettings = async (userId, settings) => {
  const { allowChallenges, allowMessages, notifications } = settings;
  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);

  if (!user.settings) {
    user.settings = { allowChallenges: true, allowMessages: true };
  }

  if (allowChallenges !== undefined) user.settings.allowChallenges = allowChallenges;
  if (allowMessages !== undefined) user.settings.allowMessages = allowMessages;

  if (notifications) {
    if (!user.settings.notifications) {
      user.settings.notifications = { platform: true, email: true, sms: false };
    }
    if (notifications.platform !== undefined) user.settings.notifications.platform = notifications.platform;
    if (notifications.email !== undefined) user.settings.notifications.email = notifications.email;
    if (notifications.sms !== undefined) user.settings.notifications.sms = notifications.sms;
  }

  await user.save();
  await redis.del(`user_profile:${userId}`);
  return user;
};
