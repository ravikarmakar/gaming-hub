import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/home/Home";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignUpPage";
import ProfilePage from "./pages/user/profile/ProfilePage";
import TeamProfile from "./pages/user/teamProfile/TeamProfile";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { useEffect, useRef } from "react";
import { useUserStore } from "./store/useUserStore";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import OrganizerRoutes from "./routes/OrganizerRoutes";

const App = () => {
  const hasCalled = useRef(false);
  const { checkAuth } = useUserStore();

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
        </Route>
      </Route>

      {/* Organizer Routes */}
      {OrganizerRoutes()}
      {/* Super Admin Routes */}
      {SuperAdminRoutes()}

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<SignupPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
