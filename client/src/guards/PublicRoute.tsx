import { Navigate, Outlet } from "react-router-dom";
import { useAuthQuery } from "@/features/auth";

const PublicRoute = () => {
  const { data: user, isLoading: checkingAuth } = useAuthQuery();

  if (checkingAuth) {
    return null; // App.tsx handles the initial black screen
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
