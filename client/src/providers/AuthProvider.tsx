import { useEffect } from "react";
import { useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import "@/lib/axiosInterceptor";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkingAuth, checkAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
    if (!checkingAuth && !user) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [checkingAuth, user, navigate, location, checkAuth]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
