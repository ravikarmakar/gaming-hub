import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/tokenGenerator.js";
import { rolesPermissions } from "../models/user.model.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, termsAccepted } = req.body;

    // Check if email exists
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // chacking email formating
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email formate" });
    }

    // checking user already exixting or not
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json("Email is already Taken");
    }

    // checking pass length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const newUser = new User({
      name,
      email,
      password,
      termsAccepted,
      role: "user",
    });

    await newUser.save();
    const token = generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Error in registerUser:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    // Check if user exists and the password matches
    if (user && (await user.matchPassword(password))) {
      const token = generateTokenAndSetCookie(user._id, res);

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          activeTeam: user.activeTeam,
        },
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error(`Error in loginUser: ${error.message}`);
    res
      .status(500)
      .json({ message: "Intrenal Server error. Please try again later." });
  }
};

export const logoutUser = (req, res) => {
  try {
    // Clear the token from cookies
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`Error in logoutUser: ${error.message}`);
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    res.json({ valid: true, user: req.user, isAuthenicated: true });
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

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
