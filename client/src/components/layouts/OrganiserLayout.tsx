import { motion } from "framer-motion";
import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import {
  BarChart,
  BarChart2,
  Bell,
  Trophy,
  Users,
  Users2,
  // Zap,
} from "lucide-react";
import { ORG_ADMIN_ROLES, SCOPES } from "@/lib/roles";
import { hasAnyRole } from "@/lib/permissions";
import Sidebar from "../super-admin/Sidebar";
import Topbar from "../super-admin/Topbar";

const sidebarLinks = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <BarChart2 size={20} />,
    href: "/organizer",
  },
  {
    id: "members",
    name: "Members",
    icon: <Users size={20} />,
    href: "/organizer/members",
  },
  {
    id: "events",
    name: "Events",
    icon: <Users2 size={20} />,
    href: "/organizer/events",
  },
  {
    id: "tournaments",
    name: "Tournaments",
    icon: <Trophy size={20} />,
    href: "/organizer/tournaments",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: <BarChart size={20} />,
    href: "/organizer/analytics",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: <Bell size={20} />,
    href: "/organizer/games",
  },
];

export default function OrganizerLayout() {
  const { user } = useUserStore();

  const hasPermission = hasAnyRole(user, SCOPES.ORG, ORG_ADMIN_ROLES);

  if (!user || !hasPermission || !user.orgId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen text-white bg-gray-900">
      <Sidebar links={sidebarLinks} title="Organizer" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-4 overflow-y-auto bg-gray-900"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
