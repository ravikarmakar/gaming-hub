import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const PublicRoute = () => {
  const { user, isLoading } = useAuthStore();

  if (user || isLoading) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
