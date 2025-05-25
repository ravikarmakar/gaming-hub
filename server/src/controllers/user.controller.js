import { TryCatchHandler } from "../middleware/error.middleware.js";
import User from "../models/user.model.js";
import { CustomError } from "../utils/CustomError.js";

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error in getUserProfile : ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getplayers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor || null;
    const search = req.query.search || "";

    let query = {};
    if (cursor) {
      query._id = { $gt: cursor };
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const users = await User.find(query).limit(limit).sort({ _id: 1 });

    const nextCursor =
      users.length === limit ? users[users.length - 1]._id : null;

    const hasMore = users.length === limit;

    res.json({ users, nextCursor, hasMore });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

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
