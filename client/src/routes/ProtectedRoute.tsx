import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, checkingAuth } = useUserStore();

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-white">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
