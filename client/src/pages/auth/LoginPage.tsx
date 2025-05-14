import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { AuthInput } from "./components/AuthInput";
import { AuthButton } from "./components/AuthButton";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { SocialLogin } from "./components/SocialLogin";
import { useUserStore } from "@/store/useUserStore";

export interface LoginFormDataType {
  identifier: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormDataType>({
    identifier: "",
    password: "",
  });
  const navigate = useNavigate();
  const { isLoading, error, login } = useUserStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(formData.identifier, formData.password);

    if (result) {
      toast.success("Login successfully");
      navigate(-1);

      setFormData({
        identifier: "",
        password: "",
      });
    }
  };

  return (
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
            <p className="text-red-500 text-sm text-center">{error}</p>
          </motion.div>
        )}

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AuthInput
            name="identifier"
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            value={formData.identifier}
            onChange={handleChange}
            required
            autoComplete="current-username"
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
            autoComplete="current-password"
          />
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="flex items-center text-gray-300 order-2 sm:order-1">
            <input
              type="checkbox"
              // checked={rememberMe}
              // onChange={handleRememberMeChange}
              className="mr-2 rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-800"
              aria-label="Remember me"
            />
            Remember me
          </label>
          <a
            href="#"
            className="text-purple-400 hover:text-purple-300 transition-colors order-1 sm:order-2 text-center sm:text-right"
          >
            Forgot password?
          </a>
        </motion.div>

        <motion.div
          className="pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AuthButton
            type="submit"
            isLoading={isLoading}
            onClick={handleSubmit}
          >
            Login to GameVerse
          </AuthButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SocialLogin
            onGoogleLogin={() => toast.success("Google login coming soon!")}
            onDiscordLogin={() => toast.success("Discord login coming soon!")}
            onGithubLogin={() => toast.success("Github login coming soon!")}
          />
        </motion.div>

        <motion.p
          className="text-center text-gray-400 text-sm sm:text-base pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Sign up now
          </Link>
        </motion.p>
      </form>
    </motion.div>
  );
};

export default LoginPage;
