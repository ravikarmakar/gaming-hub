import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, checkingAuth, checkAuth } = useUserStore();

  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
