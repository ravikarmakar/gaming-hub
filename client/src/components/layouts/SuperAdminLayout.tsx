import { motion } from "framer-motion";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  BarChart2,
  Package,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Users2,
  Zap,
} from "lucide-react";
import { hasAnyRole } from "@/lib/permissions";
import { PLATFORM_SUPER_ADMIN_ROLES, SCOPES } from "@/lib/roles";
import Sidebar from "@/ui/super-admin/Sidebar";
import Topbar from "@/ui/super-admin/Topbar";

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

export default function SuperAdminLayout() {
  const { user, checkingAuth } = useAuthStore();

  const hasPermission = hasAnyRole(
    user,
    SCOPES.PLATFORM,
    PLATFORM_SUPER_ADMIN_ROLES
  );

  // Loading screen
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-purple-500"
        >
          <Zap size={48} />
        </motion.div>
      </div>
    );
  }
  if (!user || !hasPermission) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar links={sidebarLinks} title="Super Admin" />

      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-4 overflow-y-auto bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
