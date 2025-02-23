import { motion } from "framer-motion";
import React from "react";

interface PageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e]/30 via-[#2d1b4e]/50 to-[#1a0b2e]/90 text-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 pb-12 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-600 via-orange-500 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {title}
              </span>
            </h1>
            <p className="text-purple-200/80 max-w-2xl mx-auto text-base sm:text-lg">
              {description}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-fuchsia-900/20 to-violet-900/20 blur-3xl" />
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default React.memo(PageLayout);
