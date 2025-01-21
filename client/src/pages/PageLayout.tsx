import { motion } from "framer-motion";
import React from "react";

interface PageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, description }) => {
  return (
    <motion.div
      {...fadeIn}
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          {...fadeInUp}
          className="text-center mb-12 space-y-4"
        >
          <h1 
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-500"
            aria-label={title}
          >
            {title}
          </h1>
          <p 
            className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto"
            aria-label={description}
          >
            {description}
          </p>
        </motion.div>

        <motion.div 
          {...fadeIn}
          className="w-full"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(PageLayout);
