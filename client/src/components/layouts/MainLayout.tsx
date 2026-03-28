import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/shared/layout/Navbar";
import { Suspense } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { ROUTES } from "@/lib/routes";

import { UIProvider, useUI } from "@/contexts/UIContext";
import Footer from "../shared/layout/Footer";

const HIDE_FOOTER_ROUTES = [
  ROUTES.NOTIFICATIONS,
  // Add other routes here as needed
];

const MainLayoutContent = () => {
  const location = useLocation();
  const { isFooterSuppressed } = useUI();
  const shouldHideFooter = HIDE_FOOTER_ROUTES.includes(location.pathname) || isFooterSuppressed;

  return (
    <div
      className="flex flex-col min-h-screen bg-gradient-to-br from-black via-[#0a0514] to-[#130722] selection:bg-purple-500/30"
      style={{ overflowAnchor: "none" }}
    >
      <Navbar />
      <main className="flex-grow flex flex-col relative flex-1">
        <Suspense fallback={
          <div className="flex-grow flex-1 flex items-center justify-center min-h-screen">
            <LoadingSpinner />
          </div>
        }>
          <Outlet />
          {!shouldHideFooter && <Footer />}
        </Suspense>
      </main>
    </div>
  );
};

const MainLayout = () => (
  <UIProvider>
    <MainLayoutContent />
  </UIProvider>
);

export default MainLayout;

