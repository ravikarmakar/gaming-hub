import { useTransition, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { loginSchema, LoginSchemaType } from "@/features/auth/lib/authSchemas";
import { containerVariants, itemVariants } from "@/features/auth/lib/animations";
import { showSuccessToast } from "@/lib/toast";
import { useGoogleAuth, useDiscordAuth } from "@/features/auth/hooks/auth-utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { SocialLogin } from "@/features/auth/ui/components/social-login";
import { AuthSubmitButton } from "@/features/auth/ui/components/auth-submit-button";
import { ROUTES } from "@/lib/routes";
import { useAuthLayout } from "@/features/auth/ui/components/auth-layout";

export default function LoginPage() {
    const navigate = useNavigate();
    const { isLoading, error, login } = useAuthStore();
    const { setTitle, setSubtitle } = useAuthLayout();

    // Initialize react-hook-form
    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    useEffect(() => {
        setTitle("Welcome Back");
        setSubtitle("Ready to continue your gaming journey?");
        form.reset();
    }, [setTitle, setSubtitle, form]);

    // Transition for non-blocking navigation
    const [_isPending, startTransition] = useTransition();

    // Use reusable auth hooks
    const loginWithGoogle = useGoogleAuth();
    const handleDiscordLogin = useDiscordAuth();

    const handleSubmit = async (values: LoginSchemaType) => {
        const result = await login(values.identifier, values.password);

        if (result) {
            showSuccessToast("Login successful! Welcome back!");

            // Use React 18 transition for smooth, non-blocking navigation
            startTransition(() => {
                void navigate(ROUTES.HOME);
            });
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="max-w-sm mx-auto space-y-2 text-sm"
                    noValidate
                >
                    <motion.div className="space-y-2" variants={itemVariants}>
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            label="Email"
                                            placeholder="Enter your email"
                                            icon={<Mail size={16} />}
                                            autoComplete="email"
                                            error={fieldState.error ? [fieldState.error.message!] : undefined}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            label="Password"
                                            placeholder="Enter your password"
                                            icon={<Lock size={16} />}
                                            autoComplete="current-password"
                                            error={fieldState.error ? [fieldState.error.message!] : undefined}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </motion.div>

                    <motion.div
                        className="flex justify-end text-sm mt-0.5"
                        variants={itemVariants}
                    >
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                            className="h-auto p-0 text-xs text-purple-400 hover:text-purple-300 hover:no-underline"
                        >
                            Forgot password?
                        </Button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                        <AuthSubmitButton
                            isLoading={isLoading}
                            label="Login"
                            loadingLabel="Logging in..."
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

                    <motion.div variants={itemVariants} className="mt-2">
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
            </Form>
        </motion.div>
    );
};