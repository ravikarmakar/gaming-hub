import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  LogOut,
  Package,
  Settings,
  Shield,
  TrendingUp,
  User,
  Users,
  Users2,
  X,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarLinks = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <BarChart2 size={20} />,
      href: "/super-admin",
    },
    {
      id: "users",
      name: "Users",
      icon: <Users size={20} />,
      href: "/super-admin/users",
    },
    {
      id: "organisers",
      name: "Organisers",
      icon: <Users2 size={20} />,
      href: "/super-admin/organisers",
    },
    {
      id: "games",
      name: "Games",
      icon: <Package size={20} />,
      href: "/super-admin/games",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: <TrendingUp size={20} />,
      href: "/super-admin/analytics",
    },
    {
      id: "moderation",
      name: "Moderation",
      icon: <Shield size={20} />,
      href: "/super-admin/moderation",
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings size={20} />,
      href: "/super-admin/settings",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        exit={{ x: -250 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="text-purple-500 mr-2"
            >
              <Zap size={24} />
            </motion.div>
            <h1 className="text-xl font-bold text-white">Super Admin</h1>
          </div>
          <button className="text-gray-400 hover:text-white md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1">
          <nav>
            <ul className="space-y-2 relative">
              {sidebarLinks.map((link) => (
                <li key={link.id} onClick={() => navigate(link.href)}>
                  <button
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors relative ${
                      location.pathname === link.href
                        ? "bg-purple-900 bg-opacity-50 text-purple-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span
                      className={`mr-3 ${
                        location.pathname === link.id ? "text-purple-400" : ""
                      }`}
                    >
                      {link.icon}
                    </span>
                    <span>{link.name}</span>

                    {location.pathname === link.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="w-1 h-8 bg-purple-500 absolute right-0 rounded-l"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-800 pt-4">
          <div className="flex items-center p-4 rounded-lg bg-gray-800 bg-opacity-40">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white mr-3">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
            <button className="ml-auto text-gray-400 hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Sidebar;
