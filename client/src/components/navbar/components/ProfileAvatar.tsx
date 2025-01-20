import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  // Settings,
  LogOut,
  Users,
  // Bell,
  // Heart,
  // Wallet,
} from "lucide-react";

// Navigation options stored in a variable
const navigationOptions = [
  {
    icon: User,
    label: "View Profile",
    path: "/profile",
  },
  {
    icon: Users,
    label: "Team Profile",
    path: "/team",
  },
  // {
  //   icon: Heart,
  //   label: "Favorites",
  //   path: "/favorites",
  //   description: "Your favorite items",
  // },
  // {
  //   icon: Bell,
  //   label: "Notifications",
  //   path: "/notifications",
  //   description: "View your notifications",
  // },
  // {
  //   icon: Wallet,
  //   label: "Billing",
  //   path: "/billing",
  //   description: "Manage your billing",
  // },
  // {
  //   icon: Settings,
  //   label: "Settings",
  //   path: "/settings",
  //   description: "Account preferences",
  // },
];

export const ProfileAvatar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none"
      >
        <img
          src="https://plus.unsplash.com/premium_photo-1682089877310-b2308b0dc719?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Profile Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-72 rounded-xl bg-gray-900 shadow-lg ring-1 ring-gray-700 backdrop-blur-sm"
          >
            <div className="p-2">
              {navigationOptions.map((option, index) => (
                <motion.div
                  key={option.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={option.path}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
                    onClick={() => setIsOpen(false)}
                  >
                    <option.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                        {option.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navigationOptions.length * 0.05 }}
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-500/10 transition-colors group"
                >
                  <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-red-400">
                      Sign Out
                    </span>
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const UnknowProfile = () => {
  return (
    <div>
      {/* Profile Button */}
      <Link to="/signup">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-200" />
          </div>
        </motion.button>
      </Link>
    </div>
  );
};
