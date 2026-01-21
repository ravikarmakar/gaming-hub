import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ROUTES } from "@/lib/routes";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Flow state
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { resetPassword, sendPassResetOtp, isLoading, error } = useAuthStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    const { success, message } = await sendPassResetOtp(email);
    if (success) {
      setStep(2);
      toast.success(message);
    } else {
      toast.error(error || "Failed to send reset code");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter the 6-digit code");

    setOtpLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      setOtpLoading(false);
      setStep(3);
    }, 800);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    const { success, message } = await resetPassword(email, otp, newPassword);
    if (success) {
      toast.success(message);
      navigate(ROUTES.LOGIN);
    } else {
      toast.error(error || "Reset failed");
    }
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleEmailSubmit}
            className="space-y-4"
          >
            <Input
              id="email"
              type="email"
              label="Enter Email"
              icon={<Mail className="w-4 h-4" />}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Reset Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleOtpSubmit}
            className="space-y-4"
          >
            <div className="space-y-2 text-center mb-4">
              <h2 className="text-xl font-bold text-white">Verify Code</h2>
              <p className="text-sm text-gray-400">Enter the 6-digit code sent to <span className="text-purple-400">{email}</span></p>
            </div>

            <Input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl h-14 tracking-[0.5em] font-mono bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
              placeholder="000000"
            />

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11"
              disabled={otpLoading}
            >
              {otpLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify Account
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-center text-gray-500 hover:text-white transition-colors"
            >
              Wait, that's the wrong email
            </button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handlePasswordReset}
            className="space-y-4"
          >
            <div className="space-y-2 text-center mb-4">
              <h2 className="text-xl font-bold text-white">New Password</h2>
              <p className="text-sm text-gray-400">Strong passwords help keep your gear safe</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="New Password"
                    icon={<Lock className="w-4 h-4" />}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${i <= getPasswordStrength(newPassword) ? 'bg-purple-500' : 'bg-gray-800'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    icon={<Lock className="w-4 h-4" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword === newPassword && (
                  <div className="flex items-center text-[10px] text-green-500 gap-1.5 mt-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="pt-4 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">
          🛡️ Secure Gaming Network
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
