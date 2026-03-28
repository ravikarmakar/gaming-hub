import { Loader } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full">
      <div className="relative">
        <div className="absolute inset-0 blur-2xl bg-purple-600/40 rounded-full animate-pulse" />
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
        >
          <Loader className="relative w-12 h-12 text-purple-400 animate-spin drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
        </motion.div>
      </div>
    </div>
  );
}
