import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "@/components/super-admin/Sidebar";
import Topbar from "@/components/super-admin/Topbar";
import { useUserStore } from "@/store/useUserStore";
import { Zap } from "lucide-react";

export default function SuperAdminLayout() {
  const { user, checkingAuth, checkAuth } = useUserStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      checkAuth();
      hasFetched.current = true;
    }
  }, [checkAuth]);

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
  if (!user || user.role !== "super-admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 overflow-y-auto bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
