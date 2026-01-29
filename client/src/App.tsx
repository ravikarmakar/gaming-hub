import { useEffect, useRef, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// Stores & Constants
import { ROUTES } from "@/lib/routes";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { EVENT_ROUTES } from "@/features/events/lib";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

// Layouts & Guards
import AuthLayout from "@/features/auth/ui/components/auth-layout";
import MainLayout from "@/components/layouts/MainLayout";
import ProtectedRoute from "@/guards/ProtectedRoute";
import PublicRoute from "@/guards/PublicRoute";

import { useCheckingAuth, useUser } from "@/features/auth/store/authSelectors";

// Shared Components
import { NotFound } from "@/components/NotFound";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ErrorFallback } from "@/components/ErrorFallback";
import CreateOrgDialog from "@/features/organizer/ui/components/CreateOrgDialog";
import CreateTeamModal from "@/features/teams/ui/components/CreateTeamModal";

// Lazy Loaded Pages
const HomePage = lazy(() => import("@/features/home/ui/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/ui/LoginPage"));
const SignupPage = lazy(() => import("@/features/auth/ui/SignupPage"));
const ForgotPassword = lazy(() => import("@/features/auth/ui/components/forgot-password"));
const VerifyEmail = lazy(() => import("@/features/auth/ui/components/verify-email"));
const DiscordCallback = lazy(() => import("@/features/auth/ui/components/discord-callback"));


// Organizer Features
const OrganizerProfile = lazy(() => import("@/features/organizer/ui/pages/OrganizerProfile"));
const OrganizerDashboard = lazy(() => import("@/features/organizer/ui/pages/OrganizerDashboard"));
const OrganizerMemberPage = lazy(() => import("@/features/organizer/ui/pages/OrganizerMemberPage"));
const OrganizerLayout = lazy(() => import("@/features/organizer/ui/layouts/OrganizerLayout"));
const OrganizerTournaments = lazy(() => import("@/features/organizer/ui/pages/OrganizerTournaments"));
const OrganizerSettingsPage = lazy(() => import("@/features/organizer/ui/pages/OrganizerSettingsPage"));
const OrganizerJoinRequestsPage = lazy(() => import("@/features/organizer/ui/pages/OrganizerJoinRequestsPage"));
const OrganizerNotificationsPage = lazy(() => import("@/features/organizer/ui/pages/OrganizerNotificationsPage"));

// Player Features
const PlayerIdPage = lazy(() => import("@/features/player/ui/pages/PlayerIdPage"));
const FindPlayers = lazy(() => import("@/features/player/ui/pages/FindPlayers"));

// Team Features
const TeamIdPage = lazy(() => import("@/features/teams/ui/pages/TeamIdPage"));
const TeamDashboard = lazy(() => import("@/features/teams/ui/pages/TeamDashboard"));
const TeamDashboardLayout = lazy(() => import("@/features/teams/ui/layouts/TeamLayout"));
const TeamMembersPage = lazy(() => import("@/features/teams/ui/pages/TeamMembersPage"));
const TeamStaffPage = lazy(() => import("@/features/teams/ui/pages/TeamStaffPage"));
const TeamNotificationsPage = lazy(() => import("@/features/teams/ui/pages/TeamNotificationsPage"));
const TeamSettings = lazy(() => import("@/features/teams/ui/pages/TeamSettings"));
const Teams = lazy(() => import("@/features/teams/ui/pages/FindTeams"));

// Event/Tournament Features
const CreateTournament = lazy(() => import("@/features/events/ui/pages/CreateTournament"));
const TournamentById = lazy(() => import("@/features/events/ui/pages/TournamentById"));
const AllTournaments = lazy(() => import("@/features/events/ui/pages/AllTournaments"));

// Super Admin
// const DashboardPage = lazy(() => import("@/pages/super-admin/DashboardPage"));

// Notification Features
const NotificationsPage = lazy(() => import("@/features/notifications/ui/pages/NotificationsPage"));

const App = () => {
  const checkingAuth = useCheckingAuth();
  const user = useUser();
  const { checkAuth } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!hasCalled.current) {
      checkAuth();
      hasCalled.current = true;
    }
  }, [checkAuth]);

  if (checkingAuth && user === null) {
    return <div className="fixed inset-0 z-[9999] bg-black" />;
  }

  return (
    <>
      <Toaster position="top-center" />
      <CreateOrgDialog />
      <CreateTeamModal />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path={EVENT_ROUTES.TOURNAMENTS} element={<AllTournaments />} />
              <Route path={TEAM_ROUTES.ALL_TEAMS} element={<Teams />} />

              <Route element={<ProtectedRoute />}>
                <Route path={ORGANIZER_ROUTES.PROFILE} element={<OrganizerProfile />} />
                <Route path={ROUTES.ALL_PLAYERS} element={<FindPlayers />} />
                <Route path={ROUTES.PLAYER_PROFILE} element={<PlayerIdPage />} />
                <Route path={TEAM_ROUTES.PROFILE} element={<TeamIdPage />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
                <Route path={EVENT_ROUTES.TOURNAMENT_DETAILS} element={<TournamentById />} />
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

            {/* Organizer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path={ORGANIZER_ROUTES.DASHBOARD} element={<OrganizerLayout />}>
                <Route index element={<OrganizerDashboard />} />
                <Route path={ORGANIZER_ROUTES.MEMBERS} element={<OrganizerMemberPage />} />
                <Route path={ORGANIZER_ROUTES.TOURNAMENTS} element={<OrganizerTournaments />} />
                <Route path={ORGANIZER_ROUTES.ADD_TOURNAMENTS} element={<CreateTournament />} />
                <Route path={ORGANIZER_ROUTES.EDIT_TOURNAMENT} element={<CreateTournament />} />
                <Route path={ORGANIZER_ROUTES.ANALYTICS} element={<div>Analytics</div>} />
                <Route path={ORGANIZER_ROUTES.NOTIFICATIONS} element={<OrganizerNotificationsPage />} />
                <Route path={ORGANIZER_ROUTES.JOIN_REQUESTS} element={<OrganizerJoinRequestsPage />} />
                <Route path={ORGANIZER_ROUTES.SETTINGS} element={<OrganizerSettingsPage />} />
              </Route>

              {/* <Route path={ROUTES.SUPER_ADMIN} element={<SuperAdminLayout />}>
                <Route index element={<DashboardPage />} />
                </Route> */}
            </Route>

            {/* Auth Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.EMAIL_VERIFY} element={<VerifyEmail />} />
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
