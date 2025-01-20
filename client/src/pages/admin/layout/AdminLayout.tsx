import { motion } from "framer-motion";
import { AdminHeader } from "../navigations/AdminHeader";
import { AdminSidebar } from "../navigations/AdminSidebar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
  requiredRole: "admin" | "super-admin";
}

export function AdminLayout({ children, requiredRole }: AdminLayoutProps) {
  const navigate = useNavigate();
  const userRole = "super-admin";
  const useRoleTwo = "admin";

  useEffect(() => {
    // Redirect if user doesn't have required role
    if (requiredRole === "super-admin" && userRole !== "super-admin") {
      navigate("/admin/unauthorized");
    }
  }, [requiredRole, userRole, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar role={requiredRole} />
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
