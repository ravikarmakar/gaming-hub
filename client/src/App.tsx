/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, Suspense, useState, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ROUTES } from "@/lib/constants";
import { Toaster } from "react-hot-toast";

// Components
import LoadingSpinner from "./components/LoadingSpinner";
import FreeEvents from "./pages/events/free-tournaments/FreeEvents";

// import TournamentOrgProfile from "./pages/user/tournament-org-profile/TournamentOrgProfile";
import ScrimsPage from "./pages/events/scrims/ScrimsPage";
import AdminDashboard from "./pages/admin/Dashboard";
import SuperAdminDashboard from "./pages/admin/SuperAdmin";
// import FindPlayers from "./pages/team/player/FindPlayers";
import AllPlayers from "./pages/user/all-players/AllPlayers";
import MainLayout from "./components/MainLayout";
import NotFound from "./components/NotFound";
import { useAuthStore } from "./store/useAuthStore";
import ProtectedRoute from "./providers/AuthProvider";

// Lazy-loaded components
const Home = lazy(() => import("./pages/home/Home"));
const EventPage = lazy(() => import("./pages/events/EventPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignUpPage"));
const BlogPage = lazy(() => import("./pages/blog/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/blog/BlogPostPage"));
const EventPostPage = lazy(() => import("./pages/events/EventPostPage"));
const TeamFinderPage = lazy(
  () => import("./pages/team/teamFind/TeamFinderPage")
);
const ProfilePage = lazy(() => import("./pages/user/profile/ProfilePage"));
const TeamProfile = lazy(() => import("./pages/user/teamProfile/TeamProfile"));
const Notification = lazy(() => import("./pages/notifications/Notification"));

// Error fallback component
function ErrorFallback({ error }: { error: unknown }) {
  return (
    <div role="alert" className="text-red-500 p-4">
      <p>Something went wrong:</p>
      <pre>{String(error)}</pre>
    </div>
  );
}

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
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
                        <ProfilePage />{" "}
                      </ProtectedRoute>
                    }
                  />
                  <Route path={ROUTES.TEAMPROFILE} element={<TeamProfile />} />
                  <Route
                    path={ROUTES.FREE_TOURNAMENTS}
                    element={<FreeEvents />}
                  />
                  <Route path={ROUTES.BLOG} element={<BlogPage />} />
                  <Route path={ROUTES.BLOG_POST} element={<BlogPostPage />} />
                  <Route path={ROUTES.TEAMS} element={<TeamFinderPage />} />
                  <Route path={ROUTES.EVENT} element={<EventPostPage />} />
                  <Route path={ROUTES.EVENTS} element={<EventPage />} />
                  <Route path={ROUTES.SCRIMSPAGE} element={<ScrimsPage />} />
                  <Route path={ROUTES.PLAYER} element={<AllPlayers />} />
                  <Route
                    path={ROUTES.NOTIFICATION}
                    element={<Notification />}
                  />

                  {/* Authantication */}
                  <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                  <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
                </Route>

                {/* Admin and max-admin */}
                <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
                <Route
                  path={ROUTES.MAXADMIN}
                  element={<SuperAdminDashboard />}
                />

                <Route path={ROUTES.NOTFOUND} element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
};

export default App;
