import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthQuery, useAccountEnforcement } from "@/features/auth";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";
import LoadingSpinner from "@/components/LoadingSpinner";

const ProtectedRoute = () => {
  const location = useLocation();
  const { data: user, isLoading: checkingAuth } = useAuthQuery();

  // Enforce account verification (send OTP if needed)
  useAccountEnforcement();

  if (checkingAuth && !user) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Mandatory: Redirect to verification if not verified
  if (!user.isAccountVerified && location.pathname !== AUTH_ROUTES.VERIFY_ACCOUNT) {
    return <Navigate to={AUTH_ROUTES.VERIFY_ACCOUNT} replace />;
  }

  // Redirect to home if already verified and trying to access verify-email
  if (user.isAccountVerified && location.pathname === AUTH_ROUTES.VERIFY_ACCOUNT) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
