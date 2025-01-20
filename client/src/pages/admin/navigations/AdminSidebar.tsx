import { motion } from "framer-motion";
import {
  Home,
  Users,
  TowerControl as GameController,
  Calendar,
  Trophy,
  BarChart,
  Shield,
  Database,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface AdminSidebarProps {
  role: "admin" | "super-admin";
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: GameController, label: "Games", path: "/admin/games" },
    { icon: Calendar, label: "Events", path: "/admin/events" },
    { icon: Trophy, label: "Tournaments", path: "/admin/tournaments" },
    { icon: BarChart, label: "Analytics", path: "/admin/analytics" },
  ];

  const superAdminItems = [
    { icon: Shield, label: "Admin Management", path: "/admin/manage-admins" },
    { icon: Database, label: "System Settings", path: "/admin/system" },
  ];

  const allItems =
    role === "super-admin" ? [...menuItems, ...superAdminItems] : menuItems;

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-gray-900 min-h-screen p-4 border-r border-gray-800"
    >
      <nav className="space-y-2">
        {allItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>
    </motion.aside>
  );
}
