import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/useAuthStore";

import LoadingSpinner from "@/components/LoadingSpinner";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, checkingAuth, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  if (!user || checkingAuth || isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
