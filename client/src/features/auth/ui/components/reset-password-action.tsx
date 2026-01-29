import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ROUTES } from "@/lib/routes";
import { verifyOtpSchema, resetPasswordSchema, VerifyOtpSchemaType, ResetPasswordSchemaType, } from "@/features/auth/lib/authSchemas";
import { scaleVariants } from "@/features/auth/lib/animations";
import { useAuthLayout } from "@/features/auth/ui/components/auth-layout";
import { useCountdown } from "@/hooks/use-countdown";
import { AuthSubmitButton } from "@/features/auth/ui/components/auth-submit-button";

interface ResetPasswordActionProps {
    email: string;
    onRestart: () => void;
}

export const ResetPasswordAction = ({ email, onRestart }: ResetPasswordActionProps) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(2); // 2: OTP, 3: New Password
    const { verifyPassResetOtp, resetPassword, sendPassResetOtp, isLoading, error } = useAuthStore();
    const { setTitle, setSubtitle } = useAuthLayout();

    useEffect(() => {
        if (step === 2) {
            setTitle("Verify Code");
            setSubtitle(`Enter the 6-digit code sent to your email`);
        } else if (step === 3) {
            setTitle("New Password");
            setSubtitle("Set a strong password to protect your account");
        }
    }, [step, setTitle, setSubtitle, email]);

    const { formattedTime, isExpired, reset: resetTimer, start: startTimer, pause: pauseTimer } = useCountdown(119, false);

    useEffect(() => {
        if (step === 2) {
            startTimer();
        } else {
            pauseTimer();
        }
    }, [step, startTimer, pauseTimer]);

    const handleResendOtp = async () => {
        const { success } = await sendPassResetOtp(email);
        if (success) {
            resetTimer();
        }
    };

    const otpForm = useForm<VerifyOtpSchemaType>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: { otp: "" },
    });

    const passwordForm = useForm<ResetPasswordSchemaType>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    // Use useWatch for optimized re-renders
    const [password, confirmPassword] = useWatch({
        control: passwordForm.control,
        name: ["password", "confirmPassword"],
    });

    const passwordsMatch = password === confirmPassword && password.length >= 8;

    const handleOtpVerify = async (values: VerifyOtpSchemaType) => {
        const { success, message } = await verifyPassResetOtp(email, values.otp);
        if (success) {
            toast.success(message || "Code verified successfully");
            setStep(3);
        } else {
            otpForm.setError("otp", {
                type: "manual",
                message: message || "Invalid or expired code",
            });
        }
    };

    const handlePasswordReset = async (values: ResetPasswordSchemaType) => {
        const otpValue = otpForm.getValues("otp");
        const { success, message } = await resetPassword(email, otpValue, values.password);
        if (success) {
            toast.success(message || "Password reset successful! Please login.");
            navigate(ROUTES.LOGIN);
        } else {
            toast.error(error || "Reset failed");
        }
    };

    return (
        <AnimatePresence mode="wait">
            {step === 2 && (
                <motion.div
                    key="step2"
                    variants={scaleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(handleOtpVerify)} className="space-y-4">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="text-center text-xl tracking-[0.4em] font-mono h-11"
                                                error={fieldState.error ? [fieldState.error.message!] : undefined}
                                                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                                                disabled={isExpired}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="text-center text-xs text-gray-400">
                                {!isExpired ? (
                                    <span>Code expires in <span className="font-mono text-purple-400">{formattedTime}</span></span>
                                ) : (
                                    <span className="text-red-400">Code expired</span>
                                )}
                            </div>

                            <AuthSubmitButton
                                isLoading={isLoading}
                                disabled={isExpired}
                                label="Verify Code"
                                loadingLabel="Verifying..."
                            />

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={onRestart}
                                    className="text-[11px] text-center text-gray-500 hover:text-purple-400 transition-colors"
                                >
                                    Use a different email address
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading || !isExpired}
                                    className="text-[11px] text-center text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {!isExpired ? `Resend Code in ${formattedTime}` : "Resend Code"}
                                </button>
                            </div>
                        </form>
                    </Form>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div
                    key="step3"
                    variants={scaleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                            <div className="space-y-3">
                                <FormField
                                    control={passwordForm.control}
                                    name="password"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    label="New Password"
                                                    placeholder="••••••••"
                                                    icon={<Lock className="w-4 h-4" />}
                                                    error={fieldState.error ? [fieldState.error.message!] : undefined}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    label="Confirm New Password"
                                                    placeholder="••••••••"
                                                    icon={<Lock className="w-4 h-4" />}
                                                    error={fieldState.error ? [fieldState.error.message!] : undefined}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {confirmPassword && password !== confirmPassword && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-1.5 text-[11px] text-red-400"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    <span>Passwords do not match</span>
                                </motion.div>
                            )}

                            {passwordsMatch && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400"
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Passwords match securely</span>
                                </motion.div>
                            )}

                            <AuthSubmitButton
                                isLoading={isLoading}
                                label="Reset Password"
                                loadingLabel="Resetting..."
                                className="mt-2"
                            />
                        </form>
                    </Form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};