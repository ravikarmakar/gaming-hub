import express from "express";
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
  verifyResetPasswordOtp,
  resetPassword,
  updateProfile,
  deleteAccount,
  updateSettings,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
  registerValidation,
  loginValidation,
  sendResetOtpValidation,
  verifyResetOtpValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  updateProfileValidation,
  updateSettingsValidation,
} from "../validations/auth.validation.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post(
  "/register",
  rateLimiter({ limit: 5, timer: 60, key: "register" }),
  validateRequest(registerValidation),
  register
);
router.post(
  "/login",
  rateLimiter({ limit: 5, timer: 60, key: "login" }),
  validateRequest(loginValidation),
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
  validateRequest(sendResetOtpValidation),
  sendResetPasswordOtp
);
router.post(
  "/verify-reset-otp",
  rateLimiter({ limit: 5, timer: 60, key: "verifyResetOtp" }),
  validateRequest(verifyResetOtpValidation),
  verifyResetPasswordOtp
);
router.post(
  "/reset-password",
  rateLimiter({ limit: 5, timer: 60, key: "resetPassword" }),
  validateRequest(resetPasswordValidation),
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

router.get(
  "/get-profile",
  rateLimiter({ limit: 30, timer: 60, key: "profile" }),
  isAuthenticated,
  getProfile
);

// Logout doesn't need auth middleware - just clear tokens and cookies
router.post("/logout", logout);

router.use(isAuthenticated);

// Verify account
router.post(
  "/send-verify-otp",
  rateLimiter({ limit: 5, timer: 60, key: "verifyOtp" }),
  sendVerifyOtp
);

router.post(
  "/verify-account",
  rateLimiter({ limit: 5, timer: 60, key: "verifyAccount" }),
  validateRequest(verifyEmailValidation),
  verifyEmail
);

router.put("/update-profile", upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
  rateLimiter({ limit: 5, timer: 60, key: "updateProfile" }),
  validateRequest(updateProfileValidation),
  updateProfile
);

router.delete("/delete-account", deleteAccount);
router.put("/update-settings", validateRequest(updateSettingsValidation), updateSettings);

export default router;

// TODO: Block user, unblock user