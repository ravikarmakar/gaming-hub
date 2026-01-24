import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";

export const getPlayerById = TryCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new CustomError("User ID is required", 400));
  }

  // Basic validation for MongoDB ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return next(new CustomError("Invalid Player ID format", 400));
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    return next(new CustomError("User not found", 404));
  }

  res.status(200).json({ player: user });
});

export const getAllPlayers = TryCatchHandler(async (req, res, next) => {
  const users = await User.find({
    _id: { $ne: req.user.userId },
  });

  res.status(200).json({
    players: users,
  });
});

export const searchByUsername = TryCatchHandler(async (req, res, next) => {
  const { username, page = 1, limit = 10 } = req.query;

  if (!username || typeof username !== "string") {
    return next(new CustomError("Username is required", 400));
  }

  // Minimum character validation to reduce unnecessary queries
  if (username.trim().length < 2) {
    return next(
      new CustomError("Username must be at least 2 characters long", 400)
    );
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Query to exclude the current authenticated user and search by username
  const searchQuery = {
    username: { $regex: username, $options: "i" },
    _id: { $ne: req.user.userId }, // Exclude current user
  };

  const [users, totalUsers] = await Promise.all([
    User.find(searchQuery)
      .skip(skip)
      .limit(Number(limit))
      .select("username email _id avatar teamId"), // Only return necessary fields and teamId for check
    User.countDocuments(searchQuery),
  ]);

  const hasMore = skip + users.length < totalUsers;

  res.status(200).json({
    success: true,
    players: users,
    hasMore,
    total: totalUsers, // Include total count for better UX
  });
});
