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
  changePassword,
} from "./auth.controller.js";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";
import { rateLimiter } from "../../shared/middleware/rateLimiter.middleware.js";
import { validateRequest } from "../../shared/middleware/validate.middleware.js";
import {
  registerValidation,
  loginValidation,
  sendResetOtpValidation,
  verifyResetOtpValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  updateProfileValidation,
  updateSettingsValidation,
  changePasswordValidation,
} from "./auth.validation.js";
import { upload } from "../../shared/middleware/multer.middleware.js";

const router = express.Router();

router.post(
  "/register",
  rateLimiter({ limit: 10, timer: 60, key: "register" }),
  validateRequest(registerValidation),
  register
);
router.post(
  "/login",
  rateLimiter({ limit: 10, timer: 60, key: "login" }),
  validateRequest(loginValidation),
  login
);
router.post(
  "/refresh-token",
  rateLimiter({ limit: 20, timer: 60, key: "refreshToken" }),
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
  isAuthenticated,
  rateLimiter({ limit: 100, timer: 60, key: "profile" }),
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

router.put(
  "/update-profile",
  rateLimiter({ limit: 50, timer: 60, key: "updateProfile" }),
  upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
  validateRequest(updateProfileValidation),
  updateProfile
);

router.delete("/delete-account", deleteAccount);
router.put("/update-settings", validateRequest(updateSettingsValidation), updateSettings);

router.put(
  "/change-password",
  rateLimiter({ limit: 5, timer: 60, key: "changePassword" }),
  validateRequest(changePasswordValidation),
  changePassword
);

export default router;

// TODO: Block user, unblock user