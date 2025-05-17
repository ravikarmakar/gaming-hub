import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname.includes("login");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen px-4 py-8 overflow-hidden bg-black sm:py-16">
      {/* Enhanced background elements */}
      <BackgroundAnimation />

      {/* Main container with improved animations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="backdrop-blur-xl bg-gray-900/70 rounded-xl border border-gray-800/70 shadow-2xl px-6 py-8 sm:px-8 max-h-[90vh] overflow-auto">
          {/* Back button with enhanced hover effects */}
          <motion.button
            whileHover={{ x: -3, color: "#fff" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-5 text-sm text-gray-400 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:text-purple-400" />
            <span className="group-hover:text-purple-400">Back</span>
          </motion.button>

          {/* Title section with enhanced gradients */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 space-y-2"
          >
            <motion.div
              initial={{ backgroundPosition: "0% 0%" }}
              animate={{ backgroundPosition: "100% 0%" }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              className="relative"
            >
              <h2 className="text-3xl font-bold text-center text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text bg-size-200">
                {isLogin ? "Welcome Back" : "Join GameVerse"}
              </h2>
            </motion.div>
            <p className="text-sm text-center text-gray-300 sm:text-[15px]">
              {isLogin
                ? "Ready to continue your gaming journey?"
                : "Begin your epic gaming adventure today!"}
            </p>
          </motion.div>

          {/* Content area with page transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* Footer text */}
          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 text-xs text-center text-gray-500"
          >
            © {new Date().getFullYear()} GameVerse. All rights reserved.
          </motion.p> */}
        </div>
      </motion.div>
    </div>
  );
}

export const BackgroundAnimation = () => {
  return (
    <>
      {/* Base dark gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#121212]" />

      {/* Dynamic gradient background */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/30"
      />

      {/* Moving glow effect */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-purple-900/10 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-blue-900/10 blur-[80px] animate-pulse-slower" />

      {/* Enhanced grid overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"
        style={{
          maskImage:
            "radial-gradient(circle at center, black, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black, transparent 90%)",
        }}
      />

      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Enhanced vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </>
  );
};
