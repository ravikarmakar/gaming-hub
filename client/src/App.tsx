import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import { AuthLayout } from "./components/auth/AuthLayout";
import Home from "./pages/home/Home";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignUpPage";
import MainLayout from "./components/MainLayout";
import ProfilePage from "./pages/user/profile/ProfilePage";
import TeamProfile from "./pages/user/teamProfile/TeamProfile";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { useEffect, useRef } from "react";
import { useUserStore } from "./store/useUserStore";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";

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

      {/* Admin/Organiser Routes */}
      <Route element={<ProtectedAdminRoute />}>
        {/* <Route path="admin/dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="admin/settings" element={<AdminSettings />} /> */}
      </Route>

      {/* Super Admin Routes */}
      {/* <Route element={<ProtectedSuperAdminRoute />}>
        <Route path="super-admin/users" element={<UserManagement />} />
        <Route path="super-admin/settings" element={<SuperAdminSettings />} />
      </Route> */}

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
