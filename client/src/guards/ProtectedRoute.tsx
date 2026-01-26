import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ROUTES } from "@/lib/routes";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, checkingAuth, isLoading, sendVerifyOtp } = useAuthStore();
  const hasSentOtp = useRef(false);


  useEffect(() => {
    if (user && !user.isAccountVerified && location.pathname !== ROUTES.EMAIL_VERIFY && !hasSentOtp.current) {
      // If OTP was already sent and is still valid (based on backend data), don't send again
      const isOtpActive = user.verifyOtpExpireAt && Date.now() < user.verifyOtpExpireAt;

      if (!isOtpActive) {
        hasSentOtp.current = true;
        sendVerifyOtp();
      } else {
        // Mark as sent so we don't keep checking every path change for this mount
        hasSentOtp.current = true;
      }
    }
  }, [user, location.pathname, sendVerifyOtp]);

  if (checkingAuth || isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Redirect to email verification if not verified (mandatory)
  if (!user.isAccountVerified && location.pathname !== ROUTES.EMAIL_VERIFY) {
    return <Navigate to={ROUTES.EMAIL_VERIFY} replace />;
  }

  // Redirect to home if already verified and trying to access verify-email
  if (user.isAccountVerified && location.pathname === ROUTES.EMAIL_VERIFY) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
