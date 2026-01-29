import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, ArrowRight, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { verifyOtpSchema, VerifyOtpSchemaType } from "@/features/auth/lib/authSchemas";
import { useAuthLayout } from "@/features/auth/ui/components/auth-layout";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCountdown } from "@/hooks/use-countdown";
import { ROUTES } from "@/lib/routes";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { isVerifying, verifyEmail, user, sendVerifyOtp, checkAuth } =
    useAuthStore();
  const { setTitle, setSubtitle } = useAuthLayout();

  const form = useForm<VerifyOtpSchemaType>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    setTitle("Verify Your Email");
    setSubtitle(`We've sent a 6-digit code to ${user?.email || "your email"}`);
    form.reset();
  }, [setTitle, setSubtitle, user?.email, form]);

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

  // Use reusable countdown hook
  const { formattedTime, isExpired, reset: resetTimer } = useCountdown(119);

  const onSubmit = async (values: VerifyOtpSchemaType) => {
    const { success, message } = await verifyEmail(values.otp);
    if (success) {
      toast.success(message);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.HOME);
        checkAuth();
      }, 1500);
    } else {
      toast.error(message);
      form.setValue("otp", ""); // Clear OTP on error
      form.setError("otp", { message: message });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const { success, message } = await sendVerifyOtp();
    if (success) {
      toast.success(message);
      setResendCooldown(60); // 60 seconds cooldown
      resetTimer(); // Reset expiration timer using hook
    } else {
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-center my-8">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      disabled={isVerifying || isSuccess || isExpired}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup className="gap-2">
                        {[...Array(6)].map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="w-12 h-14 text-2xl font-bold bg-white/5 border-white/10 rounded-lg text-white mx-0.5 focus:border-purple-500 focus:bg-purple-500/10 transition-all duration-300"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="text-center mt-4 text-red-400" />
                </FormItem>
              )}
            />
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4 text-sm font-medium">
            {!isExpired ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400"
              >
                Code expires in:{" "}
                <span className="font-mono text-purple-400 font-bold">
                  {formattedTime}
                </span>
              </motion.span>
            ) : (
              <span className="text-red-400 font-bold">Code expired</span>
            )}
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={
              !form.formState.isValid || isVerifying || isSuccess || isExpired
            }
            variant="gradient"
            className="w-full h-12 text-sm font-bold transition-all duration-300 shadow-lg shadow-purple-600/20 rounded-xl"
          >
            {isVerifying ? (
              <LoaderCircle className="w-5 h-5 animate-spin mr-2" />
            ) : isSuccess ? (
              <Check className="w-5 h-5 mr-2" />
            ) : null}
            {isVerifying
              ? "Verifying..."
              : isSuccess
                ? "Verified!"
                : "Verify Account"}
            {!isVerifying && !isSuccess && (
              <ArrowRight className="w-5 h-5 ml-2" />
            )}
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-4 pb-0 pt-8 text-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />
        <p className="text-gray-400 text-sm">Didn't receive the code?</p>
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
      </div>

      {/* Simple success overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a0514] border border-purple-500/30 p-10 rounded-3xl text-center shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)]"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
              <Check className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Success!</h3>
            <p className="text-gray-400 text-lg">
              Taking you to the dashboard...
            </p>
          </motion.div>
        </div>
      )}

      <p className="mt-8 text-xs text-center text-gray-500/50 uppercase tracking-widest font-mono">
        Secure Verification
      </p>
    </div>
  );
};

export default VerifyEmail;