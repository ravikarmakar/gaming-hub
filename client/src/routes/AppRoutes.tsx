import { Suspense } from "react";
import { Route, Routes, Outlet } from "react-router-dom";

// Constants & Config
import { ROUTES } from "@/lib/routes";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { EVENT_ROUTES } from "@/features/events/lib";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";
import { ORG_ACCESS } from "@/features/organizer/lib/access";
import { TEAM_ACCESS } from "@/features/teams/lib/access";

// Components & Layouts
import MainLayout from "@/components/layouts/MainLayout";
import AuthLayout from "@/features/auth/ui/components/auth-layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { pages } from "./lazy-pages";

// Guards
import ProtectedRoute from "@/guards/ProtectedRoute";
import RoleGuard from "@/guards/RoleGuard";
import PublicRoute from "@/guards/PublicRoute";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={
                <Suspense fallback={<LoadingSpinner />}>
                    <MainLayout />
                </Suspense>
            }>
                {/* Public Routes */}
                <Route index element={<pages.Home />} />
                <Route path={EVENT_ROUTES.TOURNAMENTS} element={<pages.AllTournaments />} />
                <Route path={TEAM_ROUTES.ALL_TEAMS} element={<pages.FindTeams />} />
                <Route path={ORGANIZER_ROUTES.ORGANIZERS} element={<pages.FindOrganizers />} />
                <Route path={ROUTES.SUPPORT} element={<pages.Support />} />

                {/* Protected Feature Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path={ORGANIZER_ROUTES.PROFILE} element={<pages.OrganizerProfile />} />
                    <Route path={PLAYER_ROUTES.ALL_PLAYERS} element={<pages.FindPlayers />} />
                    <Route path={PLAYER_ROUTES.PLAYER_DETAILS} element={<pages.PlayerId />} />
                    <Route path={PLAYER_ROUTES.PLAYER_SETTINGS} element={<pages.PlayerSettings />} />
                    <Route path={TEAM_ROUTES.PROFILE} element={<pages.TeamId />} />
                    <Route path={ROUTES.NOTIFICATIONS} element={<pages.Notifications />} />
                    <Route path={EVENT_ROUTES.TOURNAMENT_DETAILS} element={<pages.TournamentById />} />
                    <Route path={ROUTES.GROUP_TEAM_LIST} element={<pages.GroupTeamList />} />
                </Route>
            </Route>

            {/* Routes outside MainLayout (Dashboards, Auth, etc) */}
            <Route
                element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <Outlet />
                    </Suspense>
                }
            >
                {/* Team Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<RoleGuard access={TEAM_ACCESS.dashboard} />}>
                        <Route path={TEAM_ROUTES.DASHBOARD} element={<pages.TeamLayout />}>
                            <Route index element={<pages.TeamDashboard />} />
                            <Route path={TEAM_ROUTES.MEMBERS} element={<pages.TeamMembers />} />
                            <Route path={TEAM_ROUTES.PERFORMANCE} element={<div>performance</div>} />
                            <Route path={TEAM_ROUTES.TOURNAMENTS} element={<pages.TeamTournaments />} />
                            <Route path={TEAM_ROUTES.NOTIFICATIONS} element={<pages.TeamNotifications />} />
                            <Route path={TEAM_ROUTES.CHAT} element={<pages.TeamChat />} />
                            <Route path={TEAM_ROUTES.STAFF} element={<pages.TeamStaff />} />
                            <Route path={TEAM_ROUTES.SETTINGS} element={<pages.TeamSettings />} />
                        </Route>
                    </Route>
                </Route>

                {/* Organizer Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<RoleGuard access={ORG_ACCESS.dashboard} />}>
                        <Route path={ORGANIZER_ROUTES.DASHBOARD} element={<pages.OrganizerLayout />}>
                            <Route index element={<pages.OrganizerDashboard />} />
                            <Route path={ORGANIZER_ROUTES.MEMBERS} element={<pages.OrganizerMember />} />
                            <Route path={ORGANIZER_ROUTES.TOURNAMENTS} element={<pages.OrganizerTournaments />} />
                            <Route path={ORGANIZER_ROUTES.TOURNAMENT_DASHBOARD} element={<pages.OrganizerTournamentDashboard />} />
                            <Route path={ORGANIZER_ROUTES.ADD_TOURNAMENTS} element={<pages.CreateTournament />} />
                            <Route path={ORGANIZER_ROUTES.EDIT_TOURNAMENT} element={<pages.CreateTournament />} />
                            <Route path={ORGANIZER_ROUTES.ANALYTICS} element={<div>Analytics</div>} />
                            <Route path={ORGANIZER_ROUTES.NOTIFICATIONS} element={<pages.OrganizerNotifications />} />
                            <Route path={ORGANIZER_ROUTES.JOIN_REQUESTS} element={<pages.OrganizerJoinRequests />} />
                            <Route path={ORGANIZER_ROUTES.SETTINGS} element={<pages.OrganizerSettings />} />
                        </Route>
                    </Route>
                </Route>

                {/* Auth Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route path={AUTH_ROUTES.VERIFY_ACCOUNT} element={<pages.VerifyEmail />} />
                    </Route>
                </Route>

                <Route element={<PublicRoute />}>
                    <Route path={AUTH_ROUTES.DISCORD_CALLBACK} element={<pages.DiscordCallback />} />
                    <Route element={<AuthLayout />}>
                        <Route path={AUTH_ROUTES.LOGIN} element={<pages.Login />} />
                        <Route path={AUTH_ROUTES.REGISTER} element={<pages.Signup />} />
                        <Route path={AUTH_ROUTES.FORGOT_PASSWORD} element={<pages.ForgotPassword />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={
                <Suspense fallback={<LoadingSpinner />}>
                    <pages.NotFound />
                </Suspense>
            } />
        </Routes>
    );
};

export default AppRoutes;
