import { motion } from "framer-motion";
import DashboardHeader from "../DashboardHeader";
import { Navigate, Outlet } from "react-router-dom";
import OrganizerSidebar from "../organiser/OrganizerSidebar";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef } from "react";
import { Zap } from "lucide-react";
import { ORG_ADMIN_ROLES, SCOPES } from "@/constants/roles";
import { hasAnyRole } from "@/lib/permissions";

export default function OrganizerLayout() {
  const { user, checkingAuth, checkAuth } = useUserStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      checkAuth();
      hasFetched.current = true;
    }
  }, [checkAuth]);

  const hasPermission = hasAnyRole(user, SCOPES.ORG, ORG_ADMIN_ROLES);

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
    <div className="flex flex-col h-screen text-white bg-gray-950">
      {/* Header */}
      <div className="shrink-0">
        <DashboardHeader />
      </div>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="shrink-0">
          <OrganizerSidebar />
        </div>

        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 p-8 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
