import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi";
import { FaCheck } from "react-icons/fa";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { SocialLogin } from "./social-login";
import {
  signupSchema,
  SignupSchemaType,
} from "@/schemas/auth-validation/signupSchema";
import { useGoogleLogin } from "@react-oauth/google";

const Signup = () => {
  const navigate = useNavigate();
  const { isLoading, error, register, googleAuth } = useAuthStore();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<
    string,
    string
  > | null>(null);

  const [formData, setFormData] = useState<SignupSchemaType>({
    username: "",
    email: "",
    password: "",
    termsAccepted: false,
  });

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

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  const getPasswordStrengthText = () => {
    if (!formData.password) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    if (passwordStrength === 4) return "Strong";
    return "";
  };

  const getPasswordStrengthColor = () => {
    if (!formData.password) return "bg-gray-700";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    if (passwordStrength === 4) return "bg-green-500";
    return "bg-gray-700";
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zod Valdation
    const validationResult = signupSchema.safeParse(formData);

    if (!validationResult.success) {
      // Extract all error messages
      const errors = validationResult.error.issues.reduce((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {} as Record<string, string>);
      setValidationErrors(errors);
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions", {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#202020",
          color: "#fff",
        },
      });
      return;
    }

    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    if (result) {
      toast.success("Registration successful! Welcome to GameVerse!", {
        icon: "🎮",
        style: {
          borderRadius: "10px",
          background: "#202020",
          color: "#fff",
        },
        duration: 5000,
      });

      navigate(-1);
      setFormData({
        username: "",
        email: "",
        password: "",
        termsAccepted: false,
      });
    }
  };

  const signInWithGoogle = useGoogleLogin({
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

  const handleDiscordLogin = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      "http://localhost:5173/auth/discord/callback"
    );

    window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 border rounded-lg bg-red-500/10 border-red-500/20 backdrop-blur-sm"
            >
              <p className="flex items-center justify-center gap-2 text-sm text-center text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="space-y-4" variants={itemVariants}>
          <Input
            name="username"
            label="Username"
            placeholder="Choose your gamertag"
            icon={<User size={16} />}
            value={formData.username}
            onChange={handleChange}
            required
            error={
              validationErrors?.username
                ? [validationErrors.username]
                : undefined
            }
          />

          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email address"
            icon={<Mail size={16} />}
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            error={
              validationErrors?.email ? [validationErrors?.email] : undefined
            }
          />

          <div className="space-y-2">
            <Input
              name="password"
              label="Password"
              type="password"
              placeholder="Create a secure password"
              icon={<Lock size={16} />}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              error={
                validationErrors?.password
                  ? [validationErrors?.password]
                  : undefined
              }
            />

            {/* Password strength indicator */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1"
              >
                <div className="flex h-1 overflow-hidden bg-gray-700 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength * 25}%` }}
                    transition={{ duration: 0.3 }}
                    className={`${getPasswordStrengthColor()}`}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Password strength:</span>
                  <span
                    className={`
                    ${passwordStrength === 1 ? "text-red-400" : ""}
                    ${passwordStrength === 2 ? "text-yellow-400" : ""}
                    ${passwordStrength === 3 ? "text-blue-400" : ""}
                    ${passwordStrength === 4 ? "text-green-400" : ""}
                  `}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-start gap-2 text-sm text-gray-300">
            <label className="flex items-start cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 transition-all duration-200 border-2 border-gray-500 rounded peer-checked:border-purple-500 peer-checked:bg-purple-500/20"></div>
                <div className="absolute text-purple-500 transition-transform duration-200 scale-0 peer-checked:scale-100">
                  <FaCheck className="w-3 h-3" />
                </div>
              </div>
              <span className="ml-2 leading-relaxed">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-purple-400 transition-all duration-200 hover:text-purple-300 hover:underline underline-offset-2"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-purple-400 transition-all duration-200 hover:text-purple-300 hover:underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
          {/* ✅ Error message here */}
          {validationErrors?.termsAccepted && (
            <p className="mt-1 text-xs text-red-500">
              {validationErrors.termsAccepted[0]}
            </p>
          )}
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
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-1 group">
                  Create Account
                  <HiOutlineArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              )}
            </div>
          </button>
        </motion.div>

        {/* Social login */}
        <motion.div variants={itemVariants}>
          <SocialLogin
            onGoogleLogin={signInWithGoogle}
            onDiscordLogin={handleDiscordLogin}
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-sm text-center text-gray-400"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-purple-400 transition-all duration-200 hover:text-purple-300 hover:underline underline-offset-2"
          >
            Login here
          </Link>
        </motion.p>
      </form>
    </motion.div>
  );
};

export default Signup;
