import { Bell } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Topbar = () => {
  const [region, setRegion] = useState("IN");

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
      {/* Search */}
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-gray-400 hover:text-white"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-purple-500"></span>
          </motion.button>
        </div>
        {/* Region Dropdown (no globe icon) */}
        <div className="relative">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm focus:outline-none"
          >
            <option value="IN">🇮🇳 India</option>
            <option value="US">USA</option>
            <option value="UK">UK</option>
          </select>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
            A
          </div>
          {/* Show name only on small screens */}
          <span className="text-white text-sm font-medium block md:hidden">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
