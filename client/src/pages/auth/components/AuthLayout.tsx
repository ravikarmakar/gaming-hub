import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BackgroundAnimation } from "./BackgroundAnimation";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden p-4">
      {/* Background gradient effect */}
      <BackgroundAnimation />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 shadow-xl p-4 md:p-8">
          {/* Back button */}
          <Link to="/">
            <button className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              <span>Back</span>
            </button>
          </Link>

          {/* Title section */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-gray-400 text-center text-sm md:text-base">
              {subtitle}
            </p>
          </div>

          {/* Content area */}
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// absolute left-1/2 top-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-10 blur-[100px] bg-emerald-500
