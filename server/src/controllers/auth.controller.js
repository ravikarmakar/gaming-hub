import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { redis } from "../config/redisClient.js";
import { rolesPermissions } from "../config/rolesPermissions.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import {
  generateTokens,
  setCookies,
  storeRefreshToken,
} from "../utils/generateTokens.js";
import { oauth2Client } from "../config/googleConfig.js";
import axios from "axios";

export const register = TryCatchHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const isExistingUsername = await User.findOne({ username });
  if (isExistingUsername)
    return next(
      new CustomError("Username already exists. Please choose another.", 409)
    );

  const isExistingEmail = await User.findOne({ email });
  if (isExistingEmail)
    return next(new CustomError("Email already exists. Try logging in.", 409));

  const user = await User.create({ username, email, password });

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // store refresh token in redis
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  // remove password before sending user in response
  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    success: true,
    message: "User Register successfully",
    accessToken,
    user: userObj,
  });
});

export const login = TryCatchHandler(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new CustomError("All fields are required", 400));
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  }).select("+password");

  if (!user) {
    return next(new CustomError("Invalid credentials", 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new CustomError("Invalid credentials", 401));
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

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

  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    } catch (error) {
      // Don't throw error here, just proceed to clear cookies
      console.warn("Refresh token invalid or expired during logout.");
    }
  }

  if (accessToken) {
    try {
      await redis.setex(`blacklist_token:${accessToken}`, 15 * 60, "true");
    } catch (err) {
      console.error("Failed to blacklist access token", err);
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

  try {
    const decoded = jwt.verify(
      refreshTokenCookie,
      process.env.REFRESH_TOKEN_SECRET
    );
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshTokenCookie)
      return next(new CustomError("Invalid refresh token", 401));

    if (decoded) {
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    const user = await User.findById(decoded.userId);
    if (!user) return next(new CustomError("User not found", 404));

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // store refreshToken token in redis
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({ message: "Token refreshed successfully", accessToken });
  } catch (error) {
    next(error);
  }
});

export const googleLogin = TryCatchHandler(async (req, res, next) => {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const { data } = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
  );

  const { email, name, picture } = data;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      username: name,
      email,
      avatar: picture,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
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

export const getProfile = TryCatchHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const cacheKey = `user_profile:${userId}`;

  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      user: cachedData,
      cached: true,
    });
  }

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  await redis.setex(cacheKey, 60, JSON.stringify(user));

  return res.status(200).json({ success: true, user });
});

export const blockUser = async (req, res) => {
  try {
    const userIdToBlock = req.params.id; // ID of the user to be blocked
    const loggedInUser = req.user; // Logged-in user (max admin)

    // Check if the logged-in user is a max admin
    if (loggedInUser.role !== "max admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to block users." });
    }

    // Find the user to block
    const userToBlock = await User.findById(userIdToBlock);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found." });
    }

    // Block the user
    userToBlock.blocked = true;
    await userToBlock.save();

    res
      .status(200)
      .json({ message: `User ${userToBlock.name} has been blocked.` });
  } catch (error) {
    console.error(`Error in blockUser: ${error.message}`);
    res.status(500).json({ message: "Server error while blocking user." });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const userIdToUnblock = await User.findById(req.params.id);

    if (!userIdToUnblock) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userIdToUnblock.blocked) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    // Unblock the user
    userIdToUnblock.blocked = false;
    await userIdToUnblock.save();

    res.status(200).json({
      message: `User ${userIdToUnblock.name} unblocked successfully`,
      userIdToUnblock,
    });
  } catch (error) {
    console.error(`Error in unblockUser: ${error.message}`);
    res.status(500).json({ message: "Server error while unblocking user" });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!rolesPermissions[newRole]) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = newRole;
    await user.save(); // `pre("save")` middleware permissions auto-update karega

    res.json({ message: `User is now a ${newRole}`, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};
