// const MainLayout = () => {
//   return (
//     <div className="flex flex-col min-h-screen overflow-x-hidden">
//       <div className="fixed top-0 left-0 right-0 z-50">
//         <GamingNavbar />
//       </div>
//       <main className="flex-1 text-white">
//         <Outlet />
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default MainLayout;

import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import GamingNavbar from "./NewNavbar";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
  const location = useLocation();
  return (
    <>
      <GamingNavbar />
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
