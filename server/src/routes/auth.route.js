import expores from "express";
import {
  protectRoute,
  protectMaxAdmin,
  checkBlockedStatus,
} from "../middleware/authMiddleware.js";
// import {
//   loginUser,
//   logoutUser,
//   getUserProfile,
//   blockUser,
//   unblockUser,
// } from "../controllers/user.controller.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  blockUser,
  unblockUser,
} from "../controllers/auth.controller.js";

const router = expores.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/profile", protectRoute, checkBlockedStatus, getUserProfile);
router.put("/block-user/:id", protectRoute, protectMaxAdmin, blockUser);
router.put("/unblock-user/:id", protectRoute, protectMaxAdmin, unblockUser);
// router.put('/profile', protect, updateUserProfile);

export default router;
