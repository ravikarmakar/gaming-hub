import { motion } from "framer-motion";
import { Search } from "lucide-react";

export function BlogHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-16"
    >
      <motion.h1
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-purple-600"
      >
        Free Fire Blog
      </motion.h1>
      <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
        Stay updated with the latest strategies, updates, and community
        highlights
      </p>
      <div className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full px-6 py-3 bg-gray-900 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pl-12"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
