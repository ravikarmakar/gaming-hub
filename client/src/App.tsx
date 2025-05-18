import { useEffect, useRef } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import AuthLayout from "./components/layouts/auth-layout";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/home/Home";
import Login from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import ProfilePage from "./pages/user/profile/ProfilePage";
import TeamProfile from "./pages/user/teamProfile/TeamProfile";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { useUserStore } from "./store/useUserStore";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import OrganizerRoutes from "./routes/OrganizerRoutes";
import DiscordCallback from "./pages/auth/discord-callback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

const App = () => {
  const hasCalled = useRef(false);
  const { checkAuth, user } = useUserStore();

  useEffect(() => {
    if (!hasCalled.current) {
      checkAuth();
      hasCalled.current = true;
    }
  }, [checkAuth]);

  return (
    <Routes>
      {/* Routes with Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />

        {/* Normal Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.TEAM_PROFILE} element={<TeamProfile />} />
          <Route
            path={ROUTES.EMAIL_VERIFY}
            element={
              user?.isAccountVerified ? <Navigate to="/" /> : <VerifyEmail />
            }
          />
        </Route>
      </Route>

      {/* Organizer Routes */}
      {OrganizerRoutes()}
      {/* Super Admin Routes */}
      {SuperAdminRoutes()}

      <Route element={<PublicRoute />}>
        <Route path="/auth/discord/callback" element={<DiscordCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<SignupPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
