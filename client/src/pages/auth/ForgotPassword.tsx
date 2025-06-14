import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Flow state variables
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { resetPassword, sendPassResetOtp, error, isLoading } = useAuthStore();

  useEffect(() => {}, []);

  // Step 1: Email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    const { success, message } = await sendPassResetOtp(email);

    if (success) {
      setIsEmailSubmitted(true);
      toast.success(message);
    } else {
      toast.error(error);
    }
  };

  // Step 2: OTP submission
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp) {
      setErrors({ otp: "Verification code is required" });
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: "Please enter a 6-digit verification code" });
      return;
    }

    setOtpLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsOtpSubmitted(true);
    } catch (error) {
      console.error(error);
      setErrors({ otp: "Invalid verification code. Please try again." });
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      setErrors({ newPassword: "New password is required" });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: "Password must be at least 8 characters long" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const { success, message } = await resetPassword(email, otp, newPassword);
    if (success) {
      toast.success(message);
      navigate("/login");
    } else {
      toast.error(error);
      handleBack();
    }
  };

  const handleBack = () => {
    if (isOtpSubmitted) {
      setIsOtpSubmitted(false);
      setErrors({});
    } else if (isEmailSubmitted) {
      setIsEmailSubmitted(false);
      setErrors({});
    } else if (onBack) {
      onBack();
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["red", "orange", "yellow", "lime", "green"];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900/40 via-black to-purple-800/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="p-8 border shadow-2xl bg-gray-900/50 backdrop-blur-xl border-purple-500/20 rounded-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full">
              <AnimatePresence mode="wait">
                {!isEmailSubmitted ? (
                  <motion.div
                    key="mail"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </motion.div>
                ) : !isOtpSubmitted ? (
                  <motion.div
                    key="shield"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="lock"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Lock className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {!isEmailSubmitted ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="mb-2 text-2xl font-bold text-white">
                    Reset Password
                  </h1>
                  <p className="text-sm text-gray-400">
                    Enter your email to receive a verification code
                  </p>
                </motion.div>
              ) : !isOtpSubmitted ? (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="mb-2 text-2xl font-bold text-white">
                    Verify Code
                  </h1>
                  <p className="text-sm text-gray-400">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium text-purple-400">{email}</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="mb-2 text-2xl font-bold text-white">
                    New Password
                  </h1>
                  <p className="text-sm text-gray-400">
                    Create a strong password for your account
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            type="button"
            onClick={handleBack}
            className="absolute flex items-center gap-2 py-3 text-gray-400 transition-all duration-200 rounded-lg top-1 hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    step === 1
                      ? "bg-purple-500"
                      : step === 2 && isEmailSubmitted
                      ? "bg-purple-500"
                      : step === 3 && isOtpSubmitted
                      ? "bg-purple-500"
                      : "bg-gray-600"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step * 0.1 }}
                />
              ))}
            </div>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {!isEmailSubmitted ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 transition-all duration-200 text-white placeholder-gray-400 focus:outline-none ${
                        errors.email
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-600 focus:border-purple-500"
                      }`}
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                    <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : !isOtpSubmitted ? (
              // Step 2: OTP Form
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 transition-all duration-200 text-white text-center text-lg tracking-wider placeholder-gray-400 focus:outline-none ${
                      errors.otp
                        ? "border-red-500 focus:border-red-400"
                        : "border-gray-600 focus:border-purple-500"
                    }`}
                    placeholder="Enter 6-digit code"
                    disabled={isLoading}
                  />
                  {errors.otp && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      {errors.otp}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {otpLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Verify Code</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              // Step 3: New Password Form
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePasswordReset}
                className="space-y-6"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg bg-gray-800/50 border-2 transition-all duration-200 text-white placeholder-gray-400 focus:outline-none ${
                        errors.newPassword
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-600 focus:border-purple-500"
                      }`}
                      placeholder="Enter new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              level <= getPasswordStrength(newPassword)
                                ? `bg-${
                                    strengthColors[
                                      getPasswordStrength(newPassword) - 1
                                    ]
                                  }-500`
                                : "bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs mt-1 text-${
                          strengthColors[getPasswordStrength(newPassword) - 1]
                        }-400`}
                      >
                        {strengthLabels[getPasswordStrength(newPassword) - 1] ||
                          "Very Weak"}
                      </p>
                    </motion.div>
                  )}

                  {errors.newPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      {errors.newPassword}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg bg-gray-800/50 border-2 transition-all duration-200 text-white placeholder-gray-400 focus:outline-none ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-600 focus:border-purple-500"
                      }`}
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>

                    {/* Password Match Indicator */}
                    {confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-12 top-3.5"
                      >
                        {newPassword === confirmPassword ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-red-500 rounded-full" />
                        )}
                      </motion.div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {errors.general && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-center text-red-400"
                  >
                    {errors.general}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <CheckCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Gaming Theme Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-6 mt-8 text-center border-t border-gray-700"
          >
            <p className="text-xs text-gray-500">
              🎮 Secure your gaming account
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

function onBack() {
  throw new Error("Function not implemented.");
}
