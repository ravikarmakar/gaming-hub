import expores from "express";

import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  googleLogin,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = expores.Router();

router.post(
  "/register",
  rateLimiter({ limit: 10, timer: 60, key: "register" }),
  register
);
router.post(
  "/login",
  rateLimiter({ limit: 5, timer: 60, key: "login" }),
  login
);
router.post("/refresh-token", refreshToken);
router.get("/google", googleLogin);

router.use(isAuthenticated);

router.post("/logout", logout);
router.get("/get-profile", getProfile);

// router.put(
//   "/block-user/:id",
//   protectRoute,
//   authorizeRoles("admin", "max admin"),
//   blockUser
// );
// router.put(
//   "/unblock-user/:id",
//   protectRoute,
//   authorizeRoles("admin", "max admin"),
//   unblockUser
// );
// router.put(
//   "/change-role",
//   protectRoute,
//   authorizeRoles("admin", "max admin"),
//   changeUserRole
// );

export default router;
