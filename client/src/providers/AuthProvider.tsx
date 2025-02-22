import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "@/components/LoadingSpinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, logOut } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true); // ✅ Loading state to prevent flickering

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("gamingHubToken");
      console.log("🔹 Token from LocalStorage:", token);

      if (!token) {
        if (!location.pathname.startsWith("/login")) {
          navigate("/login");
        }
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn("Token expired, logging out...");
          logOut();
          navigate("/login");
        } else {
          setToken(token);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logOut();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const storageListener = (e: StorageEvent) => {
      if (e.key === "gamingHubToken") {
        checkAuth();
      }
    };

    window.addEventListener("storage", storageListener);
    return () => window.removeEventListener("storage", storageListener);
  }, [navigate, location.pathname, setToken, logOut]);

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
