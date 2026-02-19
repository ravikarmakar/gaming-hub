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
import { generateSecureOTP, sendVerificationEmail } from "../../shared/services/otp.service.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { syncUserInTeams } from "../team/team.service.js";
import { logger } from "../../shared/utils/logger.js";
import { AUTH_ERRORS } from "../../shared/constants/errorCodes.js";

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

/**
 * Helper to handle race conditions in OAuth user creation.
 * If E11000 (duplicate key) occurs on username, retry with a new name.
 */
const createUserWithRetry = async (userData, baseName) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const uniqueUsername = await ensureUniqueUsername(baseName);
      return await User.create({
        ...userData,
        username: uniqueUsername,
      });
    } catch (error) {
      // If duplicate key error on username (index name might vary, but code is 11000)
      if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
        attempt++;
        logger.warn(`Username race condition detected for ${baseName}. Retrying (${attempt}/${maxRetries})...`);
        if (attempt >= maxRetries) throw error;
      } else {
        throw error;
      }
    }
  }
};

export const registerUser = async ({ username, email, password }) => {
  const isExistingUsername = await User.findOne({ username });
  if (isExistingUsername) {
    throw new CustomError("Username already exists. Please choose another.", 409, AUTH_ERRORS.AUTH_DUPLICATE_USERNAME);
  }

  const isExistingEmail = await User.findOne({ email: email.toLowerCase() });
  if (isExistingEmail) {
    throw new CustomError("Email already exists. Try logging in.", 409, AUTH_ERRORS.AUTH_DUPLICATE_EMAIL);
  }

  let user;
  try {
    user = await User.create({ username, email, password });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.username) {
        throw new CustomError("Username already exists. Please choose another.", 409, AUTH_ERRORS.AUTH_DUPLICATE_USERNAME);
      }
      if (error.keyPattern?.email) {
        throw new CustomError("Email already exists. Try logging in.", 409, AUTH_ERRORS.AUTH_DUPLICATE_EMAIL);
      }
    }
    throw error;
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);
  await storeRefreshToken(user._id, refreshToken);

  // Generate and save verification OTP
  const otp = generateSecureOTP();
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 2 * 60 * 1000; // 2 mins
  await user.save();

  // Send Verification Email (non-blocking)
  sendVerificationEmail(email, otp).catch((err) =>
    logger.error("Failed to send verification email (registration):", err)
  );

  return { user, accessToken, refreshToken };
};

// Helper function to ensure unique username for OAuth users (Bounded Loop)
const ensureUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let suffix = 1;
  const maxRetries = 20;
  let retries = 0;

  while (await User.findOne({ username })) {
    if (retries >= maxRetries) {
      // Fallback to timestamp if sequential fails often
      return `${baseUsername}${Date.now()}`;
    }
    username = `${baseUsername}${suffix}`;
    suffix++;
    retries++;
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
    throw new CustomError("All fields are required", 400, AUTH_ERRORS.AUTH_TOKEN_REQUIRED);
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  }).select("+password +verifyOtpExpireAt");

  if (!user) {
    throw new CustomError("Invalid credentials", 401, AUTH_ERRORS.AUTH_INVALID_CREDENTIALS);
  }

  if (user.oauthProvider) {
    throw new CustomError(
      `This account uses ${user.oauthProvider} login. Please sign in with ${user.oauthProvider}.`,
      401,
      AUTH_ERRORS.AUTH_FORBIDDEN
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new CustomError("Invalid credentials", 401, AUTH_ERRORS.AUTH_INVALID_CREDENTIALS);
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
  // Do NOT set global credentials to avoid race conditions
  // oauth2Client.setCredentials(tokens); 

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
        AUTH_ERRORS.AUTH_FORBIDDEN
      );
    }
    if (user.oauthProvider !== "google") {
      throw new CustomError(
        `This email is linked to ${user.oauthProvider}. Please login with ${user.oauthProvider}.`,
        400,
        AUTH_ERRORS.AUTH_FORBIDDEN
      );
    }
  } else {
    // Attempt creation with retry logic for username race conditions
    user = await createUserWithRetry({
      email,
      avatar: picture,
      oauthProvider: "google",
      isAccountVerified: true,
    }, name);
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
    throw new CustomError("No email found with this Discord account.", 400, AUTH_ERRORS.AUTH_USER_NOT_FOUND);
  }

  if (!verified) {
    throw new CustomError("Email not verified. Please verify your Discord email.", 403, AUTH_ERRORS.AUTH_ACCOUNT_NOT_VERIFIED);
  }

  let user = await User.findOne({ email });
  if (user) {
    if (!user.oauthProvider) {
      throw new CustomError(
        "This email is registered with password. Please login with your password.",
        400,
        AUTH_ERRORS.AUTH_FORBIDDEN
      );
    }
    if (user.oauthProvider !== "discord") {
      throw new CustomError(
        `This email is linked to ${user.oauthProvider}. Please login with ${user.oauthProvider}.`,
        400,
        AUTH_ERRORS.AUTH_FORBIDDEN
      );
    }
  } else {
    // Discord avatar construction
    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${userRes.data.id}/${avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${(BigInt(userRes.data.id) >> 22n) % 6n}.png`;

    // Attempt creation with retry logic
    user = await createUserWithRetry({
      avatar: avatarUrl,
      email,
      oauthProvider: "discord",
      isAccountVerified: true,
    }, username);
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

  const otp = generateSecureOTP();
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


  const isMatch = await user.matchVerifyOtp(otp);
  if (!isMatch) throw new CustomError("Invalid OTP", 400, AUTH_ERRORS.AUTH_INVALID_OTP);
  if (user.verifyOtpExpireAt < Date.now()) throw new CustomError("OTP has expired", 400, AUTH_ERRORS.AUTH_OTP_EXPIRED);

  // Invalidate OTP immediately
  user.isAccountVerified = true;
  user.verifyOtp = "";
  user.verifyOtpExpireAt = 0;
  await user.save();

  // Clean cache AFTER successful save
  await redis.del(cacheKey);

  await redis.set(cacheKey, JSON.stringify(user), { ex: 60 });
  return user;
};

// In-memory L1 cache for user profiles with LRU eviction
const profileL1Cache = new Map();
const L1_TTL = 30 * 1000; // 30 seconds
const MAX_L1_CACHE_SIZE = 1000;

// Helper to set L1 cache with True LRU logic
const setL1Cache = (key, value) => {
  // If exists, delete to update position (LRU)
  if (profileL1Cache.has(key)) {
    profileL1Cache.delete(key);
  } else if (profileL1Cache.size >= MAX_L1_CACHE_SIZE) {
    // If not exists and full, delete oldest
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

export const getUserProfile = async (userId, cachedProfile, skipCache = false) => {
  const now = Date.now();
  const l1Key = `profile:${userId}`;

  // 1. Check L1 Cache (Memory) - Skip if skipCache is true
  if (!skipCache) {
    const cachedL1 = profileL1Cache.get(l1Key);
    if (cachedL1 && (now - cachedL1.timestamp < L1_TTL)) {
      logger.info(`>>> [L1 PROFILE HIT] ${userId}`);
      // Refresh LRU
      setL1Cache(l1Key, cachedL1);
      return { ...cachedL1.data, cached: true };
    }
  }

  // 2. Check cachedProfile from middleware - Skip if skipCache is true
  if (cachedProfile && !skipCache) {
    const response = { user: cachedProfile, cached: true };
    if (cachedProfile.unreadCount !== undefined) {
      response.unreadCount = cachedProfile.unreadCount;
      setL1Cache(l1Key, { data: response, timestamp: now });
      return response;
    }
  }

  // 3. Check L2 Cache (Redis) - Skip if skipCache is true
  const cacheKey = `user_profile:${userId}`;
  let cachedData = null;
  if (!skipCache) {
    try {
      cachedData = await Promise.race([
        redis.get(cacheKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 800))
      ]);
    } catch (err) {
      logger.error("Redis profile get error:", err.message);
    }
  }

  if (cachedData && !skipCache) {
    try {
      const user = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
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
    throw new CustomError("You first need to verify your email", 401, AUTH_ERRORS.AUTH_ACCOUNT_NOT_VERIFIED);

  if (user.oauthProvider)
    throw new CustomError(
      `This account uses ${user.oauthProvider} login and has no password. Please sign in with ${user.oauthProvider}.`,
      400,
      AUTH_ERRORS.AUTH_FORBIDDEN
    );

  const otp = generateSecureOTP();

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

  if (!user) throw new CustomError("User not found", 404, AUTH_ERRORS.AUTH_USER_NOT_FOUND);

  const isMatch = await user.matchResetOtp(otp);
  if (!user.resetOtp || !isMatch || user.resetOtpExpireAt < Date.now()) {
    throw new CustomError("Invalid or expired OTP", 400, AUTH_ERRORS.AUTH_INVALID_OTP);
  }

  return { message: "OTP verified successfully. You can now reset your password." };
};

export const resetUserPassword = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword)
    throw new CustomError("Email, OTP, and new password are required", 400, AUTH_ERRORS.AUTH_INVALID_CREDENTIALS);

  const user = await User.findOne({ email }).select(
    "+password +resetOtp +resetOtpExpireAt",
  );

  if (!user) throw new CustomError("User not found", 404, AUTH_ERRORS.AUTH_USER_NOT_FOUND);

  const isMatch = await user.matchResetOtp(otp);
  if (!user.resetOtp || !isMatch || user.resetOtpExpireAt < Date.now()) {
    throw new CustomError("Invalid or expired OTP", 400, AUTH_ERRORS.AUTH_INVALID_OTP);
  }

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
      400,
      AUTH_ERRORS.AUTH_FORBIDDEN
    );
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new CustomError("Current password is incorrect", 401, AUTH_ERRORS.AUTH_INVALID_CREDENTIALS);
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

    return sanitizeUserObject(user);

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
  // Invalidate any session/token data if needed, though JWTs are stateless
  // We should blacklist tokens or ensure user is logged out, but basic delete sets isDeleted which should block login.

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
  return sanitizeUserObject(user);
};
