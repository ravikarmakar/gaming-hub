import { ArrowLeft } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname.includes("login");

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
              {isLogin ? "Welcome Back, Gamer!" : "Join GameVerse"}
            </h2>
            <p className="text-gray-400 text-center text-sm sm:text-base">
              {isLogin
                ? "Ready to continue your gaming journey?"
                : "Begin your epic gaming adventure!"}
            </p>
          </motion.div>

          {/* Content area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Outlet />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export const BackgroundAnimation = () => {
  return (
    <>
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/50" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]"
        style={{
          maskImage:
            "radial-gradient(circle at center, black, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black, transparent 90%)",
        }}
      />

      {/* Light vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.3) 100%)",
        }}
      />
    </>
  );
};
