import { useEffect, useRef, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./lib/routes";
import { useUserStore } from "./store/useUserStore";

import AuthLayout from "./components/layouts/auth-layout";
import MainLayout from "./components/layouts/MainLayout";

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
  () => import("./components/layouts/OrganiserLayout")
);

const PlayerProfile = lazy(() => import("./pages/player/PlayerProfile"));
const TeamProfile = lazy(() => import("./pages/team/TeamProfile"));

const SuperAdminLayout = lazy(
  () => import("./components/layouts/SuperAdminLayout")
);
const DashboardPage = lazy(() => import("./pages/super-admin/DashboardPage"));
const TeamDashboard = lazy(() => import("./pages/team/TeamDashboard"));

// Route Guards
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";
import LoadingSpinner from "./components/LoadingSpinner";

const App = () => {
  const hasCalled = useRef(false);
  const { user, checkAuth } = useUserStore();

  useEffect(() => {
    if (!hasCalled.current) {
      checkAuth();
      hasCalled.current = true;
    }
  }, [checkAuth]);

  console.log("From Home-User:", user);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Main Routes (With Navbar/Footer) */}
        <Route element={<MainLayout />}>
          {/* Public Pages */}
          <Route index element={<Home />} />
          <Route path={ROUTES.ORG_PROFILE} element={<OrganizerProfile />} />
          <Route path={ROUTES.TEAM_PROFILE} element={<TeamProfile />} />
          <Route path={ROUTES.PROFILE} element={<PlayerProfile />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.EMAIL_VERIFY} element={<VerifyEmail />} />
            <Route path={ROUTES.CREATE_ORG} element={<CreateOrg />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Team  */}
          <Route path={ROUTES.TEAM_DASHBOARD} element={<TeamDashboard />} />

          {/* Organizer Section */}
          <Route path={ROUTES.ORG_DASHBOARD} element={<OrganizerLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="events" element={<div>Events</div>} />
            <Route path="tournaments" element={<div>Tournaments</div>} />
            <Route path="analytics" element={<div>Analytics</div>} />
            <Route path="games" element={<div>Games</div>} />
            <Route path="manage-staff" element={<div>Manage Staff</div>} />
          </Route>

          {/* Super Admin Section */}
          <Route path={ROUTES.SUPER_ADMIN} element={<SuperAdminLayout />}>
            <Route index element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Public Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.DISCORD_CALLBACK} element={<DiscordCallback />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<SignupPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
