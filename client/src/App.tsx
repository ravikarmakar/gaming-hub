import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";

import AboutSection from "./components/AboutSection";
import Footer from "./components/footer/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/home/Home";
import EventSection from "./pages/events/page/EventSection";
import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    const noNavbarRoutes = ["/login", "/signup"];

    return (
      <>
        {!noNavbarRoutes.includes(location.pathname) && <Navbar />}
        <main className="min-h-screen bg-black text-white">{children}</main>
        <Footer />
      </>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route
              path="/events"
              element={
                <MainLayout>
                  <EventSection />
                </MainLayout>
              }
            />
            <Route
              path="/about"
              element={
                <MainLayout>
                  <AboutSection />
                </MainLayout>
              }
            />

            {/* Pages without Navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
