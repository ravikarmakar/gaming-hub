import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import LoadingSpinner from "@/components/LoadingSpinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
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
