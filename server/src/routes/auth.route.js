import expores from "express";
import {
  protectRoute,
  checkBlockedStatus,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  blockUser,
  unblockUser,
  changeUserRole,
} from "../controllers/auth.controller.js";

const router = expores.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/profile", protectRoute, checkBlockedStatus, getUserProfile);
router.put(
  "/block-user/:id",
  protectRoute,
  authorizeRoles("admin", "max admin"),
  blockUser
);
router.put(
  "/unblock-user/:id",
  protectRoute,
  authorizeRoles("admin", "max admin"),
  unblockUser
);
router.put(
  "/change-role",
  protectRoute,
  authorizeRoles("admin", "max admin"),
  changeUserRole
);

export default router;
