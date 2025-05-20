import expores from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  googleLogin,
  discordLogin,
  sendVerifyOtp,
  verifyEmail,
  sendResetPasswordOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = expores.Router();

router.post(
  "/register",
  rateLimiter({ limit: 5, timer: 60, key: "register" }),
  register
);
router.post(
  "/login",
  rateLimiter({ limit: 5, timer: 60, key: "login" }),
  login
);
router.post(
  "/refresh-token",
  rateLimiter({ limit: 5, timer: 60, key: "refreshToken" }),
  refreshToken
);

// Reset Password
router.post(
  "/send-reset-otp",
  rateLimiter({ limit: 5, timer: 60, key: "resetOtp" }),
  sendResetPasswordOtp
);
router.post(
  "/reset-password",
  rateLimiter({ limit: 5, timer: 60, key: "resetPassword" }),
  resetPassword
);

// Social login
router.get(
  "/google",
  rateLimiter({ limit: 5, timer: 60, key: "loginWithGoogle" }),
  googleLogin
);
router.post(
  "/discord",
  rateLimiter({ limit: 5, timer: 60, key: "loginWithDiscord" }),
  discordLogin
);

router.use(isAuthenticated);

router.post("/logout", logout);
router.get(
  "/get-profile",
  rateLimiter({ limit: 10, timer: 60, key: "profile" }),
  getProfile
);

// Verify account
router.post(
  "/send-verify-otp",
  rateLimiter({ limit: 5, timer: 60, key: "verifyOtp" }),
  sendVerifyOtp
);
router.post(
  "/verify-account",
  rateLimiter({ limit: 5, timer: 60, key: "verifyAccount" }),
  verifyEmail
);

export default router;

// to-do ---->> update profile, block user, unblock user
