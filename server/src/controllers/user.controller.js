import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.status(200).json({ success: "Get all users successfully", users });
  } catch (error) {
    console.error(`Error in getAllUsers : ${error.message}`);
    res.status(500).json({ message: "Server error while getting all users" });
  }
};

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
