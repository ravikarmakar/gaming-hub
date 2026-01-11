import { Bell } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Topbar = () => {
  const [region, setRegion] = useState("IN");

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-gray-900 border-b border-gray-800">
      {/* Search */}
      {/* <div className="hidden w-full max-w-md sm:block">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 text-white placeholder-gray-400 bg-gray-800 rounded-lg focus:outline-none"
        />
      </div> */}

      {/* Right Side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative text-gray-400 hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></span>
        </motion.button>

        {/* Region Dropdown */}
        <div className="relative hidden sm:block">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-3 py-1 text-sm text-white bg-gray-800 rounded-lg cursor-pointer focus:outline-none"
          >
            <option value="IN">🇮🇳 India</option>
            <option value="US">🇺🇸 USA</option>
            <option value="UK">🇬🇧 UK</option>
          </select>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 text-sm text-white bg-purple-500 rounded-full">
            A
          </div>
          {/* Show name on medium and up */}
          <span className="hidden text-sm font-medium text-white md:block">
            Organizer
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
