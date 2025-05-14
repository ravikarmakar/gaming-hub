import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Users, Bell } from "lucide-react";
import { useMenu } from "../context/MenuContext";
import { useUserStore } from "@/store/useUserStore";

const navigationOptions = [
  {
    icon: User,
    label: "View Profile",
    path: "/profile",
  },
  {
    icon: Users,
    label: "Team Profile",
    path: "/team-profile",
  },
];

export const ProfileAvatar = () => {
  const navigate = useNavigate();
  const { activeMenu, setActiveMenu } = useMenu();
  const { logout, user } = useUserStore();
  const isOpen = activeMenu === "profile";

  const handleLogout = () => {
    logout();
    setActiveMenu(null);
    navigate("/");
  };

  // const isOrganizer = user?.activeOrganizer;
  const isOrganizer = false;

  return (
    <div className="relative profile-menu">
      <div className="flex justify-center items-center gap-6">
        {isOrganizer && (
          <Link to={`/dashboard`}>
            <button className="bg-gray-900/80 hover:bg-gray-800 text-slate-400 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300">
              View Dashboard
            </button>
          </Link>
        )}

        <Link to="/notifications">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-gray-200 hover:text-purple-500 transition-colors duration-200"
          >
            <Bell className="w-6 h-6" />

            {user?.notificationCount === 0 ? (
              ""
            ) : (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-gray-100 flex items-center justify-center">
                {user?.notificationCount}
              </span>
            )}
          </motion.button>
        </Link>

        {user?._id ? (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMenu(isOpen ? null : "profile")}
            className="focus:outline-none bg-white rounded-full"
          >
            <img
              src={
                user?.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
              }
              alt="Profile Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          </motion.button>
        ) : (
          <Link to="/login">
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
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-60 rounded-xl bg-gray-900 shadow-lg ring-1 ring-gray-700 backdrop-blur-sm"
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
                    onClick={() => setActiveMenu(null)}
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
