import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

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
