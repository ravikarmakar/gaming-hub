import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer";
import Navbar from "../Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Toaster position="top-center" />
    </>
  );
};

export default MainLayout;
