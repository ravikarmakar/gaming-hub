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

    const user = await User.findById(decoded.userId).select("-password");
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

// Role-based access control middleware
export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied! Unauthorized" });
    }
    next();
  };

export const restrictAccess =
  (...restrictedRoles) =>
  (req, res, next) => {
    if (restrictedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access Denied! Cannot view user profile" });
    }
    next();
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
