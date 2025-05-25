import { motion } from "framer-motion";
import { Bell, Settings, LogOut } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between h-16 px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold text-cyan-400"
        >
          Gaming Admin
        </motion.div>

        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-gray-400 transition-colors hover:text-white"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute flex items-center justify-center w-4 h-4 text-xs bg-red-500 rounded-full -top-1 -right-1">
              3
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
