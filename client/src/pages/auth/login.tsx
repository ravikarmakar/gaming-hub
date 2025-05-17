import React, { useState } from "react";
import { Mail, Lock, LoaderCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { SocialLogin } from "./social-login";
import { useUserStore } from "@/store/useUserStore";
import { Input } from "@/components/ui/input";
import {
  loginSchema,
  LoginSchemaType,
} from "@/schemas/auth-validation/loginSchema";
import { useGoogleLogin } from "@react-oauth/google";

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginSchemaType>({
    identifier: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<
    string,
    string
  > | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { isLoading, error, login, googleAuth } = useUserStore();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zod validation
    const ValidationResult = loginSchema.safeParse(formData);

    if (!ValidationResult.success) {
      const errors = ValidationResult.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));

      const errorObject = errors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {} as Record<string, string>);
      setValidationErrors(errorObject);
      return;
    }
    setValidationErrors(null);

    const result = await login(formData.identifier, formData.password);

    if (result) {
      toast.success("Login successful", {
        icon: "🎮",
        style: {
          borderRadius: "10px",
          background: "#202020",
          color: "#fff",
        },
      });
      navigate(-1);

      setFormData({
        identifier: "",
        password: "",
      });
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (authResponse) => {
      try {
        if (authResponse["code"]) {
          const result = await googleAuth(authResponse["code"]);
          if (result) {
            navigate(-1);
          }
        }
      } catch (error) {
        console.error("Error while google login", error);
      }
    },
    onError: (err) => console.error("Google login failed", err),
    flow: "auth-code",
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto space-y-5 text-sm"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 border rounded-lg bg-red-500/10 border-red-500/20 backdrop-blur-sm"
            >
              <p className="text-sm text-center text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="space-y-4" variants={itemVariants}>
          <Input
            name="identifier"
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            value={formData.identifier}
            onChange={handleChange}
            required
            autoComplete="email"
            error={
              validationErrors?.identifier
                ? [validationErrors?.identifier]
                : undefined
            }
          />
          <Input
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={<Lock size={18} />}
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            error={
              validationErrors?.password
                ? [validationErrors?.password]
                : undefined
            }
          />
        </motion.div>

        <motion.div
          className="flex flex-col items-start justify-between gap-3 text-sm sm:flex-row sm:items-center"
          variants={itemVariants}
        >
          <label className="flex items-center text-gray-300 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="sr-only peer"
                aria-label="Remember me"
              />
              <div className="w-4 h-4 transition-all duration-200 border-2 border-gray-500 rounded peer-checked:border-purple-500 peer-checked:bg-purple-500/20"></div>
              <div className="absolute text-purple-500 transition-transform duration-200 scale-0 peer-checked:scale-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <span className="ml-2 text-gray-300 transition-colors duration-200 group-hover:text-gray-200">
              Remember me
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="text-purple-400 transition-all duration-200 hover:text-purple-300 hover:underline underline-offset-2"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            className={`
              relative w-full py-2.5 px-4 rounded-lg text-sm font-medium
              overflow-hidden group
              ${isLoading ? "cursor-not-allowed opacity-80" : ""}
            `}
            disabled={isLoading}
          >
            {/* Button background with gradient animation */}
            <div className="absolute inset-0 transition-opacity duration-300 bg-gradient-to-r from-purple-600 to-blue-600 opacity-80 group-hover:opacity-100"></div>
            <div className="absolute inset-0 bg-[length:400%_400%] bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 group-hover:animate-gradient-xy"></div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 transition-opacity duration-300 bg-white opacity-0 group-hover:opacity-20 blur-xl"></div>

            {/* Button content */}
            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoaderCircle className="w-5 h-5 text-white animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-1 group">
                  Login
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              )}
            </div>
          </button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SocialLogin
            onGoogleLogin={loginWithGoogle}
            onDiscordLogin={() => toast.success("Discord login coming soon!")}
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="pt-2 text-sm text-center text-gray-400"
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-purple-400 transition-all duration-200 hover:text-purple-300 hover:underline underline-offset-2"
          >
            Sign up now
          </Link>
        </motion.p>
      </form>
    </motion.div>
  );
};

export default Login;
