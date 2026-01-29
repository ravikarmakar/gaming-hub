import { useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowRight, LoaderCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ROUTES } from "@/lib/routes";
import { forgotPasswordSchema, ForgotPasswordSchemaType } from "@/features/auth/lib/authSchemas";
import { useAuthLayout } from "@/features/auth/ui/components/auth-layout";

interface ForgotPasswordRequestProps {
    onSuccess: (email: string) => void;
}

export const ForgotPasswordRequest = ({ onSuccess }: ForgotPasswordRequestProps) => {
    const navigate = useNavigate();
    const { sendPassResetOtp, isLoading } = useAuthStore();
    const { setTitle, setSubtitle } = useAuthLayout();

    const form = useForm<ForgotPasswordSchemaType>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    useEffect(() => {
        setTitle("Forgot Password?");
        setSubtitle("Enter your email and we'll send a code to reset it");

        // Reset form when component mounts (coming back from another page)
        form.reset();
    }, [setTitle, setSubtitle, form]);

    const onSubmit = async (values: ForgotPasswordSchemaType) => {
        const { success, message } = await sendPassResetOtp(values.email);
        if (success) {
            toast.success(message || "Reset code sent successfully");
            onSuccess(values.email);
        } else {
            form.setError("email", { message: message || "Failed to send reset code" });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        label="Email Address"
                                        placeholder="name@example.com"
                                        icon={<Mail className="w-4 h-4" />}
                                        autoComplete="email"
                                        error={fieldState.error ? [fieldState.error.message!] : undefined}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            // Clear server error when user starts typing
                                            if (fieldState.error) form.clearErrors("email");
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant="gradient" className="w-full h-9" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                <span>Sending Code...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm">Send Reset Code</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-8 text-[11px] text-gray-400 hover:text-white"
                        onClick={() => navigate(ROUTES.LOGIN)}
                    >
                        <ChevronLeft className="w-3 h-3 mr-1" />
                        Back to Login
                    </Button>
                </form>
            </Form>
        </motion.div>
    );
};