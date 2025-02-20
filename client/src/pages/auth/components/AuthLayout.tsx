import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BackgroundAnimation } from "./BackgroundAnimation";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4 py-20 sm:py-24">
      {/* Background gradient effect */}
      <BackgroundAnimation />

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-800 shadow-xl p-5 sm:p-8">
          {/* Back button */}
          <Link to="/">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>
          </Link>

          {/* Title section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-6 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-gray-400 text-center text-sm sm:text-base">
              {subtitle}
            </p>
          </motion.div>

          {/* Content area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
