import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { loginSchema, LoginSchemaType } from "@/schemas/auth-validation/loginSchema";
import { showSuccessToast, showWarningToast } from "@/lib/toast";
import { useGoogleAuth, useDiscordAuth } from "@/features/auth/hooks/auth-utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { SocialLogin } from "@/features/auth/ui/components/social-login";
import { ROUTES } from "@/lib/routes";

export default function LoginPage() {
    const [formData, setFormData] = useState<LoginSchemaType>({
        identifier: "",
        password: "",
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

    const navigate = useNavigate();
    const { isLoading, error, login } = useAuthStore();

    // Use reusable auth hooks
    const loginWithGoogle = useGoogleAuth();
    const handleDiscordLogin = useDiscordAuth();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    // Optimized handleChange with useCallback
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Clear validation error for this field when user starts typing
        if (validationErrors?.[name]) {
            setValidationErrors((prev) => {
                if (!prev) return null;
                const updated = { ...prev };
                delete updated[name];
                return Object.keys(updated).length === 0 ? null : updated;
            });
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === "identifier" ? value.trim() : value, // Trim email
        }));
    }, [validationErrors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Zod validation
        const validationResult = loginSchema.safeParse(formData);

        if (!validationResult.success) {
            // Extract validation errors
            const errors = validationResult.error.issues.reduce((acc, issue) => {
                const field = issue.path[0] as string;
                acc[field] = issue.message;
                return acc;
            }, {} as Record<string, string>);

            setValidationErrors(errors);

            // Show toast for first error
            const firstError = Object.values(errors)[0];
            showWarningToast(firstError);
            return;
        }

        // Clear validation errors on successful validation
        setValidationErrors(null);

        const result = await login(formData.identifier, formData.password);

        if (result) {
            showSuccessToast("Login successful! Welcome back!");

            // Clear form
            setFormData({
                identifier: "",
                password: "",
            });

            navigate(ROUTES.HOME);
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <form
                onSubmit={handleSubmit}
                className="max-w-sm mx-auto space-y-2.5 text-sm"
                noValidate
            >
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            key="server-error"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-2.5 border rounded-lg bg-red-500/10 border-red-500/20 backdrop-blur-sm"
                        >
                            <p className="flex items-center justify-center gap-1.5 text-xs text-center text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div className="space-y-2" variants={itemVariants}>
                    <Input
                        name="identifier"
                        type="email"
                        label="Email"
                        placeholder="Enter your email"
                        icon={<Mail size={16} />}
                        value={formData.identifier}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        error={
                            validationErrors?.identifier
                                ? [validationErrors.identifier]
                                : undefined
                        }
                    />
                    <Input
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        icon={<Lock size={16} />}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        error={
                            validationErrors?.password
                                ? [validationErrors.password]
                                : undefined
                        }
                    />
                </motion.div>

                <motion.div
                    className="flex justify-end text-sm"
                    variants={itemVariants}
                >
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                        className="h-auto p-0 text-purple-400 hover:text-purple-300 hover:no-underline"
                    >
                        Forgot password?
                    </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Button
                        type="submit"
                        variant="gradient"
                        className="w-full h-9"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <span>Login</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <SocialLogin
                        onGoogleLogin={loginWithGoogle}
                        onDiscordLogin={handleDiscordLogin}
                    />
                </motion.div>

                <motion.p
                    variants={itemVariants}
                    className="text-xs text-center text-gray-400"
                >
                    Don't have an account?{" "}
                    <Link
                        to={ROUTES.REGISTER}
                        className="font-medium text-purple-400 transition-all duration-200 hover:text-purple-300 hover:underline underline-offset-2"
                    >
                        Sign up now
                    </Link>
                </motion.p>
            </form>
        </motion.div>
    );
};


