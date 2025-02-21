import { Outlet } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <main className="flex-1 text-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
