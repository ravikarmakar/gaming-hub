import { motion } from "framer-motion";
import { BlogHeader } from "./components/BlogHeader";
import { BlogGrid } from "./components/BlogGrid";

export default function BlogPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <BlogHeader />
        <BlogGrid />
      </div>
    </motion.div>
  );
}
