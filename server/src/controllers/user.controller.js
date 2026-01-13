import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";

export const getPlayerById = TryCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new CustomError("User ID is required", 400));
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

  const skip = (Number(page) - 1) * Number(limit);

  const [users, totalUsers] = await Promise.all([
    User.find({
      username: { $regex: username, $options: "i" },
    })
      .skip(skip)
      .limit(Number(limit))
      .select("username email _id avatar"),
    User.countDocuments({
      username: { $regex: username, $options: "i" },
    }),
  ]);

  const hasMore = skip + users.length < totalUsers;

  res.status(200).json({
    success: true,
    players: users,
    hasMore,
  });
});
