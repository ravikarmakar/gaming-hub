import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const PublicRoute = () => {
  const { user, checkingAuth } = useAuthStore();

  if (checkingAuth) {
    return null; // App.tsx handles the initial black screen
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
