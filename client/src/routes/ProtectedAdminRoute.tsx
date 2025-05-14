import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdminRoute = () => {
  const user = { role: "admin" };
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedAdminRoute;
