import { useEffect, useRef, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import { ROUTES } from "./lib/routes";
import { useAuthStore } from "./features/auth/store/useAuthStore";

import AuthLayout from "@/components/layouts/auth-layout";
import MainLayout from "@/components/layouts/MainLayout";

const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/auth/login"));
const SignupPage = lazy(() => import("./pages/auth/signup"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const DiscordCallback = lazy(() => import("./pages/auth/discord-callback"));

const CreateOrg = lazy(() => import("./pages/organiser/CreateOrg"));
const OrganizerProfile = lazy(
  () => import("./pages/organiser/OrganizerProfile")
);
const Dashboard = lazy(() => import("./pages/organiser/Dashboard"));
const Members = lazy(() => import("./pages/organiser/Members"));
const OrganizerLayout = lazy(
  () => import("@/components/layouts/OrganiserLayout")
);

const PlayerIdPage = lazy(
  () => import("@/features/player/ui/pages/PlayerIdPage")
);
const TeamIdPage = lazy(() => import("@/features/teams/ui/pages/TeamIdPage"));

const SuperAdminLayout = lazy(
  () => import("@/components/layouts/SuperAdminLayout")
);
const DashboardPage = lazy(() => import("./pages/super-admin/DashboardPage"));

// Route Guards
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";
import { NotFound } from "./components/NotFound";
import LoadingSpinner from "./components/LoadingSpinner";
import { ErrorFallback } from "./components/ErrorFallback";
import TeamDashboard from "./features/teams/ui/pages/TeamDashboard";
import TeamDashboardLayout from "./features/teams/ui/layouts/TeamLayout";
import TeamMembersPage from "./features/teams/ui/pages/TeamMembersPage";

const App = () => {
  const hasCalled = useRef(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    if (!hasCalled.current) {
      checkAuth();
      hasCalled.current = true;
    }
  }, [checkAuth]);

  return (
    <>
      <Toaster />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />

              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.EMAIL_VERIFY} element={<VerifyEmail />} />
                <Route path={ROUTES.CREATE_ORG} element={<CreateOrg />} />
                <Route
                  path={ROUTES.ORG_PROFILE}
                  element={<OrganizerProfile />}
                />
                <Route
                  path={ROUTES.PLAYER_PROFILE}
                  element={<PlayerIdPage />}
                />
                <Route
                  path={ROUTES.NOTIFICATIONS}
                  element={<div>Notifi</div>}
                />
                <Route path={ROUTES.TEAM_PROFILE} element={<TeamIdPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                path={ROUTES.TEAM_DASHBOARD}
                element={<TeamDashboardLayout />}
              >
                <Route index element={<TeamDashboard />} />
                <Route path="players" element={<TeamMembersPage />} />
                <Route path="performance" element={<div>performance</div>} />
                <Route path="tournaments" element={<div>tournaments</div>} />
                <Route
                  path="notifications"
                  element={<div>notifications</div>}
                />
                <Route path="settings" element={<div>settings</div>} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.ORG_DASHBOARD} element={<OrganizerLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="events" element={<div>Events</div>} />
                <Route path="tournaments" element={<div>Tournaments</div>} />
                <Route path="analytics" element={<div>Analytics</div>} />
                <Route path="games" element={<div>Games</div>} />
                <Route path="manage-staff" element={<div>Manage Staff</div>} />
              </Route>

              <Route path={ROUTES.SUPER_ADMIN} element={<SuperAdminLayout />}>
                <Route index element={<DashboardPage />} />
              </Route>
            </Route>

            <Route element={<PublicRoute />}>
              <Route
                path={ROUTES.DISCORD_CALLBACK}
                element={<DiscordCallback />}
              />
              <Route
                path={ROUTES.FORGOT_PASSWORD}
                element={<ForgotPassword />}
              />
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<SignupPage />} />
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
