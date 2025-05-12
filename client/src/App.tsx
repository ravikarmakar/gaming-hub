/* eslint-disable react-hooks/exhaustive-deps */
import { Suspense, lazy, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ROUTES } from "@/lib/constants";
import { Toaster } from "react-hot-toast";

// Stores
import useAuthStore from "./store/useAuthStore";

// Frequently Used Components (Direct Import for Performance)
import LoadingSpinner from "./components/LoadingSpinner";
import MainLayout from "./components/MainLayout";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./providers/AuthProvider";
import AllTeams from "./components/AllTeams";
import CreateTeam from "./pages/auth/CreateTeam";
import AdminDashboard from "./pages/admin/Dashboard";
import SuperAdminDashboard from "./pages/admin/SuperAdmin";
import OrganizerRoutes from "./routes/OrganizerRoutes";

// Lazy-loaded components (Rarely used or page-specific)
const Home = lazy(() => import("./pages/home/Home"));
const EventPage = lazy(() => import("./pages/events/EventPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignUpPage"));
const BlogPage = lazy(() => import("./pages/blog/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/blog/BlogPostPage"));
const EventPostPage = lazy(() => import("./pages/events/EventPostPage"));
const ProfilePage = lazy(() => import("./pages/user/profile/ProfilePage"));
const TeamProfile = lazy(() => import("./pages/user/teamProfile/TeamProfile"));
const Notification = lazy(() => import("./pages/notifications/Notification"));
const FreeEvents = lazy(
  () => import("./pages/events/free-tournaments/FreeEvents")
);
const ScrimsPage = lazy(() => import("./pages/events/scrims/ScrimsPage"));
const AllPlayers = lazy(() => import("./pages/user/all-players/AllPlayers"));

// Error Fallback Component
const ErrorFallback = () => (
  <div className="p-4 text-red-500">
    Authentication error - Please refresh or <a href="/login">login again</a>
  </div>
);

const App = () => {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [isAuthenticated]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-indigo-900/10 via-purple-900/20 to-blue-900/30"
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route
                  path={ROUTES.PROFILE}
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.TEAMPROFILE}
                  element={
                    <ProtectedRoute>
                      <TeamProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.USERTEAMPROFILE}
                  element={<TeamProfile />}
                />
                <Route path={ROUTES.USERPROFILE} element={<ProfilePage />} />
                <Route
                  path={ROUTES.FREE_TOURNAMENTS}
                  element={<FreeEvents />}
                />
                <Route path={ROUTES.BLOG} element={<BlogPage />} />
                <Route path={ROUTES.BLOG_POST} element={<BlogPostPage />} />
                <Route path={ROUTES.TEAMS} element={<AllTeams />} />
                <Route path={ROUTES.EVENT} element={<EventPostPage />} />
                <Route path={ROUTES.EVENTS} element={<EventPage />} />
                <Route path={ROUTES.SCRIMSPAGE} element={<ScrimsPage />} />
                <Route path={ROUTES.PLAYER} element={<AllPlayers />} />
                <Route path={ROUTES.NOTIFICATION} element={<Notification />} />

                {/* Authentication */}
                <Route
                  path={ROUTES.LOGIN}
                  element={isAuthenticated ? <Home /> : <LoginPage />}
                />
                <Route
                  path={ROUTES.SIGNUP}
                  element={isAuthenticated ? <Home /> : <SignupPage />}
                />
                <Route path={ROUTES.CREATE_TEAM} element={<CreateTeam />} />
              </Route>

              {/* Admin Routes */}
              <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
              <Route path={ROUTES.MAXADMIN} element={<SuperAdminDashboard />} />
              <Route path={ROUTES.NOTFOUND} element={<NotFound />} />

              {/* Organizer Routes  */}
              <Route
                path={ROUTES.ORGANIZER_DASHBOARD}
                element={<OrganizerRoutes />}
              />
            </Routes>
          </Suspense>
          <Toaster position="top-center" />
        </motion.div>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

export default App;
