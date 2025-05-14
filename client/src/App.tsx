import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import { AuthLayout } from "./components/auth/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignUpPage";
import MainLayout from "./components/MainLayout";
import ProfilePage from "./pages/user/profile/ProfilePage";
import TeamProfile from "./pages/user/teamProfile/TeamProfile";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useUserStore } from "./store/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import PublicRoute from "./routes/PublicRoute";
import { ROUTES } from "./constants/routes";

const App = () => {
  const { user, checkAuth, checkingAuth, accessToken } = useUserStore();
  useEffect(() => {
    checkAuth();
    console.log("backend called");
  }, [checkAuth]);

  console.log("Root data", user);
  console.log("AccessToken", accessToken);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Routes with Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />

        {/* Normal Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path="team-profile" element={<TeamProfile />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      {/* <Route element={<ProtectedAdminRoute />}>
      <Route path="admin/dashboard" element={<AdminDashboard />} />
      <Route path="admin/settings" element={<AdminSettings />} />
    </Route> */}

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
