import { motion } from "framer-motion";
import DashboardHeader from "../DashboardHeader";
import DashboardSidebar from "../DashboardSidebar";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Role } from "@/types";
import useAuthStore from "@/store/useAuthStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole: Role = user?.role || "user";

  console.log(user);

  useEffect(() => {
    // Redirect if user doesn't have required role
    if (userRole === "organizer" && userRole !== "organizer") {
      navigate("/dashboard");
    }
  }, [userRole, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar role={userRole} />
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
