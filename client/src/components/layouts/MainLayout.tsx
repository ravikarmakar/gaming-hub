import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "../Footer";
import { Suspense } from "react";
import LoadingSpinner from "../LoadingSpinner";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-[#0a0514] to-[#130722] selection:bg-purple-500/30">
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
      <Footer />
    </div>
  );
};

export default MainLayout;
