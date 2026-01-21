import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import LoadingSpinner from "@/components/LoadingSpinner";

const PublicRoute = () => {
  const { user, isLoading, checkingAuth } = useAuthStore();

  if (isLoading || checkingAuth) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
