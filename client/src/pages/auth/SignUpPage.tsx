import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { AuthLayout } from "./components/AuthLayout";
import { AuthInput } from "./components/AuthInput";
import { AuthButton } from "./components/AuthButton";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

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
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-500 p-2 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        <AuthInput
          name="name"
          label="name"
          placeholder="Choose your name"
          icon={<User size={18} />}
          value={formData.name}
          onChange={handleChange}
        />

        <AuthInput
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          icon={<Mail size={18} />}
          value={formData.email}
          onChange={handleChange}
        />

        <AuthInput
          name="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          icon={<Lock size={18} />}
          value={formData.password}
          onChange={handleChange}
        />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              name="termsAccepted"
              required
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800 p-2"
              // aria-invalid={!!errors.termsAccepted}
            />
            <span>
              I agree to the{" "}
              <a
                href="#"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Privacy Policy
              </a>
            </span>
          </div>
          {/* {error.termsAccepted && (
            <p className="text-red-500 text-sm">{error.termsAccepted}</p>
          )} */}
        </div>

        <AuthButton type="submit" onClick={handleSubmit} isLoading={isLoading}>
          Create Account
        </AuthButton>

        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
