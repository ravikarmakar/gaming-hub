import { Navigate, Outlet } from "react-router-dom";

const ProtectedSuperAdminRoute = () => {
  const user = { role: "super-admin" };
  return user.role === "super-admin" ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedSuperAdminRoute;
