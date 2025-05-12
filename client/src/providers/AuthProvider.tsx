import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import LoadingSpinner from "@/components/LoadingSpinner";

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setCheckingAuth(false);
    };
    verifyAuth();
  }, [checkAuth, isAuthenticated]);

  useEffect(() => {
    if (!checkingAuth && !isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { state: { from: location } });
    }
  }, [checkingAuth, isAuthenticated, navigate, location]);

  if (checkingAuth || isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import useAuthStore from "@/store/useAuthStore";
// import LoadingSpinner from "@/components/LoadingSpinner";
// import { Role } from "@/types"; // ✅ Role Type Import

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredRoles?: Role[]; // ✅ Multiple Roles Allowed
// }

// const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, checkAuth, isAuthenticated, isLoading } = useAuthStore();
//   const [checkingAuth, setCheckingAuth] = useState(true);

//   useEffect(() => {
//     const verifyAuth = async () => {
//       await checkAuth();
//       setCheckingAuth(false);
//     };
//     verifyAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (!checkingAuth && !isAuthenticated && location.pathname !== "/login") {
//       navigate("/login", { state: { from: location } });
//     }
//   }, [checkingAuth, isAuthenticated, navigate, location]);

//   if (checkingAuth || isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // ✅ Role-Based Access Control (RBAC) Logic
//   const userRole: Role = user?.role || "user"; // Default "user"
//   const hasAccess = requiredRoles ? requiredRoles.includes(userRole) : true;

//   if (!hasAccess) {
//     return (
//       <div className="text-center mt-20 text-red-500">
//         <h1 className="text-2xl font-bold">Access Denied</h1>
//         <p>You don't have permission to view this page.</p>
//       </div>
//     );
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;
