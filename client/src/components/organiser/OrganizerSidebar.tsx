import { motion } from "framer-motion";
import {
  Home,
  Users,
  Calendar,
  Trophy,
  BarChart,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export default function OrganizerSidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/organizer" },
    { icon: Users, label: "Users", path: "/organizer/users" },
    { icon: Calendar, label: "Events", path: "/organizer/events" },
    { icon: Trophy, label: "Tournaments", path: "/organizer/tournaments" },
    { icon: BarChart, label: "Analytics", path: "/organizer/analytics" },
    { icon: Bell, label: "Notifications", path: "/organizer/games" },
  ];

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800"
    >
      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 text-gray-300 mb-2">
          <User className="w-6 h-6" />
          <div>
            <p className="text-sm font-medium">Ravi Karmkar</p>
            <p className="text-xs text-gray-500">Organizer</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}
