import React from "react";
import { BackgroundAnimation } from "./BackgroundAnimation";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <BackgroundAnimation />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-4 sm:p-8"
      >
        <div
          className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-800 p-4 sm:p-6 
          shadow-[0_0_50px_0_rgba(6,182,212,0.1)] 
          hover:shadow-[0_0_80px_0_rgba(6,182,212,0.2)] 
          transition-all duration-500"
        >
          <Link to="/">
            <span className="flex gap-3">
              <ArrowLeft className="w-6 h-6 text-white" />
              Back
            </span>
          </Link>

          <h2
            className="text-3xl font-bold text-center mb-2 font-orbitron 
            bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 
            bg-300% animate-gradient bg-clip-text text-transparent"
          >
            {title}
          </h2>
          <p className="text-gray-400 text-center mb-8">{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
};
