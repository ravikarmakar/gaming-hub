import React, { useState, useCallback, useEffect } from "react";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "./components/AuthLayout";
import { AuthInput } from "./components/AuthInput";
import { AuthButton } from "./components/AuthButton";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import toast from "react-hot-toast";

export interface formDataType {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const { logIn, isLoading, error } = useUserStore();

  const navigate = useNavigate();

  // Check if user is already logged in (on page load)
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMeEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // handlers

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRememberMeChange = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await logIn(formData);
      // Save email if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberMeEmail", formData.email);
      } else {
        localStorage.removeItem("rememberMeEmail");
      }
      navigate("/");
      useUserStore.setState({ error: null });
    } catch (error) {
      // toast.error(error || "Login failed, please try again.");

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      // Only show the error if it's not already handled by zustand
      if (errorMessage && errorMessage !== error) {
        useUserStore.setState({ error: errorMessage });
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome Back, Gamer!"
      subtitle="Ready to continue your gaming journey?"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
          placeholder="Enter your password"
          icon={<Lock size={18} />}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              className="mr-2 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800"
              aria-label="Remember me"
            />
            Remember me
          </label>
          <a
            href="#"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <AuthButton type="submit" isLoading={isLoading}>
          <span className="flex items-center justify-center">
            Login to GameVerse
          </span>
        </AuthButton>
        <p className="text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Sign up now
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
