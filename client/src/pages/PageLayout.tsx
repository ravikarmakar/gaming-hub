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
    <div className="min-h-screen bg-[#0B0B1E] text-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 pb-12 relative"
      >
        {/* <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-full h-full bg-purple-500/20 rounded-full blur-3xl" />
          </div>
        </div> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {title}
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
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
        {children}
      </motion.main>
    </div>
  );
};

export default React.memo(PageLayout);
