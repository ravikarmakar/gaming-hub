import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";

// Auth (TanStack Query)
import { useAuthQuery, useSessionSync } from "@/features/auth";

// Contexts
import { SocketProvider } from "@/contexts/SocketContext";

// Components
import { ErrorFallback } from "@/components/ErrorFallback";
import CreateOrgDialog from "@/features/organizer/ui/components/CreateOrgDialog";
import CreateTeamDialog from "@/features/teams/ui/components/dialogs/CreateTeamDialog";
import ScrollToTop from "@/components/shared/layout/ScrollToTop";

// Routes
import AppRoutes from "@/routes/AppRoutes";

const App = () => {
  // Cross-tab session sync (instantly close all tabs on logout)
  useSessionSync();

  // TanStack Query handles the initial auth check automatically on mount
  const { isLoading } = useAuthQuery();

  // Only show the global blackout for the initial auth load
  if (isLoading) {
    return <div className="fixed inset-0 z-[9999] bg-[#02000a]" />;
  }

  return (
    <SocketProvider>
      <Toaster position="top-center" />
      <CreateOrgDialog />
      <CreateTeamDialog />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ScrollToTop />
        <AppRoutes />
      </ErrorBoundary>
    </SocketProvider>
  );
};

export default App;
