import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  let token;

  // Check if token exists in the cookies
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user information to the request object
    req.user = await User.findById(decoded.userId).select("-password");

    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error(`Error in protect: ${error.message}`);
    res.status(401).json({ message: "Not authorized, invalid token" });
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
