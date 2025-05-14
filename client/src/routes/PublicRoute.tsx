import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";

const PublicRoute = () => {
  const { user } = useUserStore();

  if (user) {
    // already logged in → redirect to home or profile
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
