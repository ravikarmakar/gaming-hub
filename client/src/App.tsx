import { useEffect, useRef, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// Stores & Constants
import { ROUTES } from "./lib/routes";
import { TEAM_ROUTES } from "./features/teams/lib/routes";
import { useAuthStore } from "./features/auth/store/useAuthStore";

// Layouts & Guards
import AuthLayout from "@/features/auth/ui/components/auth-layout";
import MainLayout from "@/components/layouts/MainLayout";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";

// Shared Components
import { NotFound } from "./components/NotFound";
import LoadingSpinner from "./components/LoadingSpinner";
import { ErrorFallback } from "./components/ErrorFallback";

// Lazy Loaded Pages
const HomePage = lazy(() => import("@/features/home/ui/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/ui/LoginPage"));
const SignupPage = lazy(() => import("@/features/auth/ui/SignupPage"));
const ForgotPassword = lazy(() => import("@/features/auth/ui/components/forgot-password"));
const VerifyEmail = lazy(() => import("@/features/auth/ui/components/verify-email"));
const DiscordCallback = lazy(() => import("@/features/auth/ui/components/discord-callback"));

// Organizer Features
const CreateOrg = lazy(() => import("@/features/organizer/ui/pages/CreateOrg"));
const OrganizerProfile = lazy(() => import("./pages/organiser/OrganizerProfile"));
const Dashboard = lazy(() => import("./pages/organiser/Dashboard"));
const Members = lazy(() => import("./pages/organiser/Members"));
const OrganizerLayout = lazy(() => import("@/features/organizer/ui/components/OrganiserLayout"));
const ViewEventOrg = lazy(() => import("@/features/organizer/ui/pages/ViewEventOrg"));

// Player Features
const PlayerIdPage = lazy(() => import("@/features/player/ui/pages/PlayerIdPage"));
const FindPlayers = lazy(() => import("@/features/player/ui/pages/FindPlayers"));

// Team Features
const TeamIdPage = lazy(() => import("@/features/teams/ui/pages/TeamIdPage"));
const TeamDashboard = lazy(() => import("./features/teams/ui/pages/TeamDashboard"));
const TeamDashboardLayout = lazy(() => import("./features/teams/ui/layouts/TeamLayout"));
const TeamMembersPage = lazy(() => import("@/features/teams/ui/pages/TeamMembersPage"));
const TeamStaffPage = lazy(() => import("@/features/teams/ui/pages/TeamStaffPage"));
const TeamNotificationsPage = lazy(() => import("@/features/teams/ui/pages/TeamNotificationsPage"));
const TeamSettings = lazy(() => import("@/features/teams/ui/pages/TeamSettings"));
const AllTeams = lazy(() => import("@/features/teams/ui/pages/FindTeams"));

// Event/Tournament Features
const CreateTournament = lazy(() => import("@/features/events/ui/pages/CreateTournament"));
const ViewEventById = lazy(() => import("@/features/events/ui/pages/ViewEventById"));
const ViewAllEvents = lazy(() => import("@/features/events/ui/pages/ViewAllEvents"));

// Super Admin
const SuperAdminLayout = lazy(() => import("@/components/layouts/SuperAdminLayout"));
const DashboardPage = lazy(() => import("./pages/super-admin/DashboardPage"));

// Notification Features
const NotificationsPage = lazy(() => import("@/features/notifications/ui/pages/NotificationsPage"));

const App = () => {
  const { checkAuth, checkingAuth } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!hasCalled.current) {
      checkAuth();
      hasCalled.current = true;
    }
  }, [checkAuth]);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Toaster />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path={ROUTES.ALL_EVENTS} element={<ViewAllEvents />} />
              <Route path={ROUTES.ALL_TEAMS} element={<AllTeams />} />

              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.EMAIL_VERIFY} element={<VerifyEmail />} />
                <Route path={ROUTES.CREATE_ORG} element={<CreateOrg />} />
                <Route path={ROUTES.ORG_PROFILE} element={<OrganizerProfile />} />
                <Route path={ROUTES.ALL_PLAYERS} element={<FindPlayers />} />
                <Route path={ROUTES.PLAYER_PROFILE} element={<PlayerIdPage />} />
                <Route path={TEAM_ROUTES.PROFILE} element={<TeamIdPage />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
                <Route path={ROUTES.EVENT_DETAILS} element={<ViewEventById />} />
              </Route>
            </Route>

            {/* Team Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path={TEAM_ROUTES.DASHBOARD} element={<TeamDashboardLayout />}>
                <Route index element={<TeamDashboard />} />
                <Route path={TEAM_ROUTES.MEMBERS} element={<TeamMembersPage />} />
                <Route path={TEAM_ROUTES.PERFORMANCE} element={<div>performance</div>} />
                <Route path={TEAM_ROUTES.TOURNAMENTS} element={<div>tournaments</div>} />
                <Route path={TEAM_ROUTES.NOTIFICATIONS} element={<TeamNotificationsPage />} />
                <Route path={TEAM_ROUTES.STAFF} element={<TeamStaffPage />} />
                <Route path={TEAM_ROUTES.SETTINGS} element={<TeamSettings />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.ORG_DASHBOARD} element={<OrganizerLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="tournaments" element={<ViewEventOrg />} />
                <Route path="add-tournaments" element={<CreateTournament />} />
                <Route path="analytics" element={<div>Analytics</div>} />
                <Route path="games" element={<div>Games</div>} />
                <Route path="notifications" element={<div>Notifi</div>} />
              </Route>

              <Route path={ROUTES.SUPER_ADMIN} element={<SuperAdminLayout />}>
                <Route index element={<DashboardPage />} />
              </Route>
            </Route>

            <Route element={<PublicRoute />}>
              <Route path={ROUTES.DISCORD_CALLBACK} element={<DiscordCallback />} />
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<SignupPage />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              </Route>
            </Route>

            {/* Safety Redirects for common manual URL entry errors */}
            <Route path="/verify-otp" element={<Navigate to={ROUTES.EMAIL_VERIFY} replace />} />
            <Route path="/player/verify-otp" element={<Navigate to={ROUTES.EMAIL_VERIFY} replace />} />
            <Route path="/players/verify-otp" element={<Navigate to={ROUTES.EMAIL_VERIFY} replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
