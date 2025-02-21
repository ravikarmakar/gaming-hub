import { Outlet } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-x-hidden text-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
