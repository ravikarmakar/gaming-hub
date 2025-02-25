import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { AuthLayout } from "./components/AuthLayout";
import { AuthInput } from "./components/AuthInput";
import { AuthButton } from "./components/AuthButton";
import { motion } from "framer-motion";
import useAuthStore from "@/store/useAuthStore";
import { SocialLogin } from "./components/SocialLogin";
import toast from "react-hot-toast";

export interface FormDataType {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    password: "",
    termsAccepted: false,
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(formData);
      navigate("/");

      setFormData({
        name: "",
        email: "",
        password: "",
        termsAccepted: false,
      });
      useAuthStore.setState({ error: null });
    } catch (error) {
      // Handle error (if any) not already handled by zustand
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      // Only show the error if it's not already handled by zustand
      if (errorMessage && errorMessage !== error) {
        useAuthStore.setState({ error: errorMessage });
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AuthLayout
      title="Join GameVerse"
      subtitle="Begin your epic gaming adventure!"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
            >
              <p className="text-red-500 text-sm text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </p>
            </motion.div>
          )}

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AuthInput
              name="name"
              label="Name"
              placeholder="Choose your name"
              icon={<User size={18} />}
              value={formData.name}
              onChange={handleChange}
              required
            />

            <AuthInput
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <AuthInput
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                name="termsAccepted"
                required
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-800"
              />
              <span className="leading-relaxed">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </span>
            </div>
          </motion.div>

          <motion.div
            className="pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AuthButton
              type="submit"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Create Account
            </AuthButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <SocialLogin
              onGoogleLogin={() => toast.success("Google signup coming soon!")}
              onDiscordLogin={() =>
                toast.success("Discord signup coming soon!")
              }
              onGithubLogin={() => toast.success("Github signup coming soon!")}
            />
          </motion.div>

          <motion.p
            className="text-center text-gray-400 text-sm sm:text-base pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Login here
            </Link>
          </motion.p>
        </form>
      </motion.div>
    </AuthLayout>
  );
};

export default SignupPage;
