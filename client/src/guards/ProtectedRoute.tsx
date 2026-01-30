import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, checkingAuth, sendVerifyOtp } = useAuthStore();
  const hasSentOtp = useRef(false);


  useEffect(() => {
    if (user && !user.isAccountVerified && location.pathname !== AUTH_ROUTES.VERIFY_ACCOUNT && !hasSentOtp.current) {
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

  if (checkingAuth) {
    return null;
  }

  if (!user) {
    return <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Redirect to email verification if not verified (mandatory)
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
