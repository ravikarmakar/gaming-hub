import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";
import LoadingSpinner from "@/components/LoadingSpinner";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, checkingAuth, sendVerifyOtp } = useAuthStore();



  useEffect(() => {
    if (user && !user.isAccountVerified && location.pathname !== AUTH_ROUTES.VERIFY_ACCOUNT) {
      const storageKey = `otp_sent_${user._id}`;
      const hasSentSession = sessionStorage.getItem(storageKey);

      // If OTP was already sent and is still valid (based on backend data), don't send again
      const isOtpActive = user.verifyOtpExpireAt && Date.now() < user.verifyOtpExpireAt;

      if (!isOtpActive && !hasSentSession) {
        sessionStorage.setItem(storageKey, "true");
        sendVerifyOtp();
      } else if (!hasSentSession) {
        // Even if active, mark as sent for this session so we don't spam
        sessionStorage.setItem(storageKey, "true");
      }
    }
  }, [user, location.pathname, sendVerifyOtp]);

  if (checkingAuth && !user) {
    return <LoadingSpinner />;
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
