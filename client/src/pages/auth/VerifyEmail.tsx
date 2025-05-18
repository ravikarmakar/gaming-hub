import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, ArrowRight, RefreshCw } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { isVerifying, verifyEmail, user, sendVerifyOtp, error } =
    useUserStore();

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all fields are filled
      if (value && newOtp.every((digit) => digit !== "")) {
        handleVerify(newOtp.join(""));
      }
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpString: string) => {
    const { success, message } = await verifyEmail(otpString);
    if (success) {
      toast.success(message);
      setIsSuccess(success);
      navigate("/");
    } else {
      toast.error(message);
      setOtp(new Array(6).fill(""));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const { success, message } = await sendVerifyOtp();
    if (success) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900/40 via-black to-purple-80/40">
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
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">
              Verify Your Email
            </h1>
            <p className="text-sm text-gray-400">
              We've sent a 6-digit code to{" "}
              <span className="font-medium text-purple-400">{user?.email}</span>
              The code is valid for{" "}
              <span className="font-medium text-white">10 minutes</span>.
            </p>
          </motion.div>

          {/* OTP Input */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-3 mb-4"
            >
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 transition-all duration-200 ${
                    digit
                      ? "border-purple-500 bg-purple-500/10 text-purple-300"
                      : "border-gray-600 bg-gray-800/50 text-white"
                  } focus:border-purple-400 focus:bg-purple-500/20 focus:outline-none focus:scale-105`}
                  disabled={isVerifying || isSuccess}
                  whileFocus={{ scale: 1.05 }}
                />
              ))}
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 text-sm text-center text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Verify Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleVerify(otp.join(""))}
            disabled={otp.some((digit) => !digit) || isVerifying || isSuccess}
            className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </motion.div>
              ) : isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Verified!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span>Verify Code</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Resend Code */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="mb-2 text-sm text-gray-400">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isVerifying}
              className="font-medium text-purple-400 transition-colors hover:text-purple-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <span>Resend Code</span>
              )}
            </button>
          </motion.div>

          {/* Gaming Theme Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-6 mt-8 text-center border-t border-gray-700"
          >
            <p className="text-xs text-gray-500">
              🎮 Level up your gaming experience
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Success Celebration */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: window.innerHeight / 2,
                  x: window.innerWidth / 2,
                  scale: 0,
                }}
                animate={{
                  opacity: 0,
                  y: Math.random() * window.innerHeight,
                  x: Math.random() * window.innerWidth,
                  scale: Math.random() * 1 + 0.5,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                }}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyEmail;
