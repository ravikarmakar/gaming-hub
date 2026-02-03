import { useEffect, useRef, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// Stores & Constants
import { ROUTES } from "@/lib/routes";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { EVENT_ROUTES } from "@/features/events/lib";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

// Layouts & Guards
import AuthLayout from "@/features/auth/ui/components/auth-layout";
import MainLayout from "@/components/layouts/MainLayout";
import ProtectedRoute from "@/guards/ProtectedRoute";
import RoleGuard from "@/guards/RoleGuard";
import PublicRoute from "@/guards/PublicRoute";
import { ORG_ACCESS } from "@/features/organizer/lib/access";
import { TEAM_ACCESS } from "@/features/teams/lib/access";

import { useCheckingAuth } from "@/features/auth/store/authSelectors";

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
const OrganizerTournamentDashboard = lazy(() => import("@/features/organizer/ui/pages/OrganizerTournamentDashboard"));
const FindOrganizers = lazy(() => import("@/features/organizer/ui/pages/FindOrganizers"));

// Player Features
const PlayerIdPage = lazy(() => import("@/features/player/ui/pages/PlayerIdPage"));
const FindPlayers = lazy(() => import("@/features/player/ui/pages/FindPlayers"));
const PlayerSettings = lazy(() => import("@/features/player/ui/pages/PlayerSettings"));

// Team Features
const TeamIdPage = lazy(() => import("@/features/teams/ui/pages/TeamIdPage"));
const TeamDashboard = lazy(() => import("@/features/teams/ui/pages/TeamDashboard"));
const TeamDashboardLayout = lazy(() => import("@/features/teams/ui/layouts/TeamLayout"));
const TeamMembersPage = lazy(() => import("@/features/teams/ui/pages/TeamMembersPage"));
const TeamStaffPage = lazy(() => import("@/features/teams/ui/pages/TeamStaffPage"));
const TeamNotificationsPage = lazy(() => import("@/features/teams/ui/pages/TeamNotificationsPage"));
const TeamSettings = lazy(() => import("@/features/teams/ui/pages/TeamSettings"));
const TeamTournamentsPage = lazy(() => import("@/features/teams/ui/pages/TeamTournamentsPage"));
const Teams = lazy(() => import("@/features/teams/ui/pages/FindTeams"));

// Event/Tournament Features
const CreateTournament = lazy(() => import("@/features/events/ui/pages/CreateTournament"));
const TournamentById = lazy(() => import("@/features/events/ui/pages/TournamentById"));
const AllTournaments = lazy(() => import("@/features/events/ui/pages/AllTournaments"));

// Super Admin
// const DashboardPage = lazy(() => import("@/pages/super-admin/DashboardPage"));

// Notification Features
const NotificationsPage = lazy(() => import("@/features/notifications/ui/pages/NotificationsPage"));
const GroupTeamList = lazy(() => import("@/features/organizer/ui/pages/GroupTeamList"));

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

  // Only show the global blackout for the initial auth check when we're sure we're loading
  if (checkingAuth && !hasCalled.current) {
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
              <Route path={ORGANIZER_ROUTES.ORGANIZERS} element={<FindOrganizers />} />

              <Route element={<ProtectedRoute />}>
                <Route path={ORGANIZER_ROUTES.PROFILE} element={<OrganizerProfile />} />
                <Route path={PLAYER_ROUTES.ALL_PLAYERS} element={<FindPlayers />} />
                <Route path={PLAYER_ROUTES.PLAYER_DETAILS} element={<PlayerIdPage />} />
                <Route path={PLAYER_ROUTES.PLAYER_SETTINGS} element={<PlayerSettings />} />
                <Route path={TEAM_ROUTES.PROFILE} element={<TeamIdPage />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
                <Route path={EVENT_ROUTES.TOURNAMENT_DETAILS} element={<TournamentById />} />
                <Route path={ROUTES.GROUP_TEAM_LIST} element={<GroupTeamList />} />
              </Route>
            </Route>

            {/* Team Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleGuard access={TEAM_ACCESS.dashboard} />}>
                <Route path={TEAM_ROUTES.DASHBOARD} element={<TeamDashboardLayout />}>
                  <Route index element={<TeamDashboard />} />
                  <Route path={TEAM_ROUTES.MEMBERS} element={<TeamMembersPage />} />
                  <Route path={TEAM_ROUTES.PERFORMANCE} element={<div>performance</div>} />
                  <Route path={TEAM_ROUTES.TOURNAMENTS} element={<TeamTournamentsPage />} />
                  <Route path={TEAM_ROUTES.NOTIFICATIONS} element={<TeamNotificationsPage />} />
                  <Route path={TEAM_ROUTES.STAFF} element={<TeamStaffPage />} />
                  <Route path={TEAM_ROUTES.SETTINGS} element={<TeamSettings />} />
                </Route>
              </Route>
            </Route>

            {/* Organizer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleGuard access={ORG_ACCESS.dashboard} />}>
                <Route path={ORGANIZER_ROUTES.DASHBOARD} element={<OrganizerLayout />}>
                  <Route index element={<OrganizerDashboard />} />
                  <Route path={ORGANIZER_ROUTES.MEMBERS} element={<OrganizerMemberPage />} />
                  <Route path={ORGANIZER_ROUTES.TOURNAMENTS} element={<OrganizerTournaments />} />
                  <Route path={ORGANIZER_ROUTES.TOURNAMENT_DASHBOARD} element={<OrganizerTournamentDashboard />} />
                  <Route path={ORGANIZER_ROUTES.ADD_TOURNAMENTS} element={<CreateTournament />} />
                  <Route path={ORGANIZER_ROUTES.EDIT_TOURNAMENT} element={<CreateTournament />} />
                  <Route path={ORGANIZER_ROUTES.ANALYTICS} element={<div>Analytics</div>} />
                  <Route path={ORGANIZER_ROUTES.NOTIFICATIONS} element={<OrganizerNotificationsPage />} />
                  <Route path={ORGANIZER_ROUTES.JOIN_REQUESTS} element={<OrganizerJoinRequestsPage />} />
                  <Route path={ORGANIZER_ROUTES.SETTINGS} element={<OrganizerSettingsPage />} />
                </Route>
              </Route>

              {/* <Route path={ROUTES.SUPER_ADMIN} element={<SuperAdminLayout />}>
                <Route index element={<DashboardPage />} />
                </Route> */}
            </Route>

            {/* Auth Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthLayout />}>
                <Route path={AUTH_ROUTES.VERIFY_ACCOUNT} element={<VerifyEmail />} />
              </Route>
            </Route>
            <Route element={<PublicRoute />}>
              <Route path={AUTH_ROUTES.DISCORD_CALLBACK} element={<DiscordCallback />} />
              <Route element={<AuthLayout />}>
                <Route path={AUTH_ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={AUTH_ROUTES.REGISTER} element={<SignupPage />} />
                <Route path={AUTH_ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
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
