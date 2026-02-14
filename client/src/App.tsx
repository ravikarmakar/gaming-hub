import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";

// Stores
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCheckingAuth } from "@/features/auth/store/authSelectors";

// Contexts
import { SocketProvider } from "@/contexts/SocketContext";

// Components
import { ErrorFallback } from "@/components/ErrorFallback";
import CreateOrgDialog from "@/features/organizer/ui/components/CreateOrgDialog";
import CreateTeamModal from "@/features/teams/ui/components/CreateTeamModal";
import ScrollToTop from "@/components/shared/ScrollToTop";

// Routes
import AppRoutes from "@/routes/AppRoutes";

const App = () => {
  const checkingAuth = useCheckingAuth();
  const { checkAuth } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!hasCalled.current) {
      checkAuth();
      hasCalled.current = true;
    }
  }, [checkAuth]);

  // Only show the global blackout for the initial auth load
  if (checkingAuth && !hasCalled.current) {
    return <div className="fixed inset-0 z-[9999] bg-[#02000a]" />;
  }

  return (
    <SocketProvider>
      <Toaster position="top-center" />
      <CreateOrgDialog />
      <CreateTeamModal />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ScrollToTop />
        <AppRoutes />
      </ErrorBoundary>
    </SocketProvider>
  );
};

export default App;
