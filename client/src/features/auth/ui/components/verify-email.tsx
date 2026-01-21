import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, ArrowRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ROUTES } from "@/lib/routes";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { isVerifying, verifyEmail, user, sendVerifyOtp, error, checkAuth } =
    useAuthStore();

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
      setIsSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.HOME);
        checkAuth();
      }, 1500);
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
      setResendCooldown(60); // 60 seconds cooldown
    } else {
      toast.error(message);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-black">
      {/* Background Image with Overlay (Same as AuthLayout) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/auth-bg.png"
          alt="Gaming Background"
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-purple-900/10 mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4 mx-auto">
        <Card className="backdrop-blur-xl bg-gray-900/40 border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-2xl">
          {/* Header Accent */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500" />

          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-white mb-1">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm font-medium px-4">
              We've sent a 6-digit code to <br />
              <span className="font-bold text-purple-400">{user?.email || "your email"}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            {/* OTP Input Grid */}
            <div className="flex justify-between gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={`w-full max-w-[48px] h-12 text-center text-xl font-black rounded-lg border-2 transition-all duration-200 ${digit
                    ? "border-purple-500 bg-purple-500/20 text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]"
                    : "border-white/10 bg-white/5 text-white"
                    } focus:border-cyan-400 focus:bg-cyan-400/10 focus:outline-none focus:ring-0`}
                  disabled={isVerifying || isSuccess}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={() => handleVerify(otp.join(""))}
              disabled={otp.some((digit) => !digit) || isVerifying || isSuccess}
              variant="gradient"
              className="w-full h-10 text-sm font-bold transition-all duration-300 shadow-lg shadow-purple-600/20"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : isSuccess ? (
                <Check className="w-4 h-4 mr-2" />
              ) : null}
              {isVerifying ? "Verifying..." : isSuccess ? "Verified!" : "Verify Account"}
              {!isVerifying && !isSuccess && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-10 pt-0 text-center">
            <div className="w-full h-px bg-white/5 mb-2" />
            <p className="text-gray-400 text-sm">
              Didn't receive the code?
            </p>
            <Button
              variant="link"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isVerifying}
              className="h-auto p-0 font-bold text-purple-400 hover:text-purple-300 transition-colors disabled:text-gray-600"
            >
              {resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                "Resend New Code"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Simple success overlay */}
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-gray-900 border border-purple-500/30 p-8 rounded-3xl text-center shadow-2xl">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-gray-400">Taking you to the dashboard...</p>
            </div>
          </div>
        )}

        <p className="mt-8 text-sm text-center text-gray-500">
          🎮 Step into the next level of gaming
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
