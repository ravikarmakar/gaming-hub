import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "../Footer";
import { Suspense } from "react";
import LoadingSpinner from "../LoadingSpinner";

const MainLayout = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-purple-500/30">
      <Navbar />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-grow relative"
        >
          <div className="relative min-h-[70vh]">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default MainLayout;
