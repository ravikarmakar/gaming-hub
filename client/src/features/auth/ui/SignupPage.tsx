import { useMemo, useTransition, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { SocialLogin } from "@/features/auth/ui/components/social-login";
import { AuthSubmitButton } from "@/features/auth/ui/components/auth-submit-button";
import { signupSchema, SignupSchemaType } from "@/features/auth/lib/authSchemas";
import { containerVariants, itemVariants } from "@/features/auth/lib/animations";
import { useGoogleAuth, useDiscordAuth } from "@/features/auth/hooks/auth-utils";
import { showSuccessToast } from "@/lib/toast";
import { ROUTES } from "@/lib/routes";
import { useAuthLayout } from "@/features/auth/ui/components/auth-layout";

export default function SignupPage() {
    const navigate = useNavigate();
    const { isLoading, error, register } = useAuthStore();
    const { setTitle, setSubtitle } = useAuthLayout();

    // Initialize react-hook-form
    const form = useForm<SignupSchemaType>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            termsAccepted: false,
        },
    });

    useEffect(() => {
        setTitle("Join GameVerse");
        setSubtitle("Begin your epic gaming adventure today!");
        form.reset();
    }, [setTitle, setSubtitle, form]);

    const [_isPending, startTransition] = useTransition();

    const signInWithGoogle = useGoogleAuth();
    const handleDiscordLogin = useDiscordAuth();

    const password = form.watch("password");

    const passwordStrength = useMemo(() => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    }, [password]);

    const getPasswordStrengthText = () => {
        if (!password) return "";
        if (passwordStrength === 1) return "Weak";
        if (passwordStrength === 2) return "Fair";
        if (passwordStrength === 3) return "Good";
        if (passwordStrength === 4) return "Strong";
        return "";
    };

    const getPasswordStrengthColor = () => {
        if (!password) return "bg-gray-700";
        if (passwordStrength === 1) return "bg-red-500";
        if (passwordStrength === 2) return "bg-amber-500";
        if (passwordStrength === 3) return "bg-purple-500";
        if (passwordStrength === 4) return "bg-emerald-500";
        return "bg-gray-700";
    };

    const handleSubmit = async (values: SignupSchemaType) => {
        const result = await register(
            values.username,
            values.email,
            values.password
        );

        if (result) {
            showSuccessToast("Registration successful! Welcome to GameVerse!");

            // Use React 18 transition for smooth, non-blocking navigation
            startTransition(() => {
                // Navigate to email verification if account needs verification
                if (!result.isAccountVerified) {
                    void navigate(ROUTES.EMAIL_VERIFY);
                } else {
                    void navigate(ROUTES.HOME);
                }
            });
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2" noValidate>
                    <motion.div className="space-y-2" variants={itemVariants}>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            label="Username"
                                            placeholder="Choose your gamertag"
                                            icon={<User size={16} />}
                                            error={fieldState.error ? [fieldState.error.message!] : undefined}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            label="Email"
                                            type="email"
                                            placeholder="Enter your email address"
                                            icon={<Mail size={16} />}
                                            autoComplete="email"
                                            error={fieldState.error ? [fieldState.error.message!] : undefined}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="space-y-1">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                label="Password"
                                                type="password"
                                                placeholder="Create a secure password"
                                                icon={<Lock size={16} />}
                                                autoComplete="new-password"
                                                error={fieldState.error ? [fieldState.error.message!] : undefined}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Password strength indicator */}
                            {password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-0.5"
                                >
                                    <div className="flex h-1 overflow-hidden bg-gray-700 rounded-full">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${passwordStrength * 25}%` }}
                                            transition={{ duration: 0.2 }}
                                            className={`${getPasswordStrengthColor()}`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-gray-400">Strength:</span>
                                        <span
                                            className={`
                        ${passwordStrength === 1 ? "text-red-400" : ""}
                        ${passwordStrength === 2 ? "text-amber-400" : ""}
                        ${passwordStrength === 3 ? "text-purple-400" : ""}
                        ${passwordStrength === 4 ? "text-emerald-400" : ""}
                      `}
                                        >
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div className="space-y-1" variants={itemVariants}>
                        <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <div className="flex items-start gap-1.5 text-xs text-gray-300">
                                        <FormControl>
                                            <div className="relative flex items-center mt-[2px]">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="w-3.5 h-3.5 border-gray-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                                />
                                            </div>
                                        </FormControl>

                                        <span className="leading-snug">
                                            I agree to the{" "}
                                            <Link
                                                to={ROUTES.TERMS}
                                                className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-2"
                                            >
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                to={ROUTES.PRIVACY}
                                                className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-2"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </div>

                                    <FormMessage className="text-[11px] leading-tight" />
                                </FormItem>
                            )}
                        />

                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                        <AuthSubmitButton
                            isLoading={isLoading}
                            label="Create Account"
                            loadingLabel="Creating Account..."
                        />
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-center text-red-400 font-medium"
                            >
                                {error}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Social login */}
                    <motion.div variants={itemVariants} className="mt-2">
                        <SocialLogin
                            onGoogleLogin={signInWithGoogle}
                            onDiscordLogin={handleDiscordLogin}
                        />
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-xs text-center text-gray-400"
                    >
                        Already have an account?{" "}
                        <Link
                            to={ROUTES.LOGIN}
                            className="font-medium text-purple-400 transition-all duration-200 hover:text-purple-300 hover:underline underline-offset-2"
                        >
                            Login here
                        </Link>
                    </motion.p>
                </form>
            </Form>
        </motion.div>
    );
};