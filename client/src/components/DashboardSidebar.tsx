import { Role } from "@/types";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  // TowerControl as GameController,
  Calendar,
  Trophy,
  BarChart,
  Bell,
  // Shield,
  User2,
  // Database,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface DashboardSidebarProps {
  role: Role;
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Users", path: "/dashboard/users" },
    { icon: Calendar, label: "Events", path: "/dashboard/events" },
    { icon: Trophy, label: "Tournaments", path: "/dashboard/tournaments" },
    { icon: BarChart, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Bell, label: "Notifications", path: "/dashboard/games" },
  ];

  const organiserOwner = [
    {
      icon: User2,
      label: "Staff Management",
      path: "/dashboard/manage-staff",
    },
    // { icon: Database, label: "System Settings", path: "/dashboard/system" },
  ];

  const allItems =
    role === "organizer" ? [...menuItems, ...organiserOwner] : menuItems;

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
    </motion.aside>
  );
}
