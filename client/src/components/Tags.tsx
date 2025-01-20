import { tags } from "@/lib/constants";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// FilterTag Component

export const FilterTag = ({ text }: { text: string }) => (
  <motion.span
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 hover:bg-purple-500/20 cursor-pointer transition-all"
  >
    {text}
  </motion.span>
);

// Tags Component
export const Tags = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-wrap gap-2 justify-center lg:pt-6 p-3"
    >
      {tags.map((tag, index) => (
        <motion.div key={index} variants={fadeInUp} custom={index}>
          <FilterTag text={tag} />
        </motion.div>
      ))}
    </motion.div>
  );
};
