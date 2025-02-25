import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
    .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Error in protectRoute: ${error.message}`);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Middleware to check if the user is an admin or max admin
export const protectAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // User is admin, proceed to the next middleware
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

// Middleware to check if the user is a max admin
export const protectMaxAdmin = (req, res, next) => {
  if (req.user && req.user.role === "max admin") {
    next(); // User is max admin, proceed to the next middleware
  } else {
    res.status(403).json({ message: "Not authorized as max admin" });
  }
};

// Middleware for check Blocked User
export const checkBlockedStatus = async (req, res, next) => {
  try {
    // Fetch the user by their ID (from req.user, which was added in the protectRoute middleware)
    const user = await User.findById(req.user._id);

    // Check if the user is blocked
    if (user && user.blocked) {
      return res
        .status(403)
        .json({ message: "Your account has been blocked." });
    }

    next(); // User is not blocked, proceed to the next middleware/controller
  } catch (error) {
    console.error(`Error in checkBlockedUser: ${error.message}`);
    res
      .status(500)
      .json({ message: "Server error while checking blocked status." });
  }
};
