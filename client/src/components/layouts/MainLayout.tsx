import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "../Footer";
import { Suspense } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { ROUTES } from "@/lib/routes";

const HIDE_FOOTER_ROUTES = [
  ROUTES.NOTIFICATIONS,
  // Add other routes here as needed
];

const MainLayout = () => {
  const location = useLocation();
  const shouldHideFooter = HIDE_FOOTER_ROUTES.includes(location.pathname);

  return (
    <div
      className="flex flex-col min-h-screen bg-gradient-to-br from-black via-[#0a0514] to-[#130722] selection:bg-purple-500/30"
      style={{ overflowAnchor: "none" }}
    >
      <Navbar />
      <main className="flex-grow flex flex-col relative flex-1">
        <Suspense fallback={
          <div className="flex-grow flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
