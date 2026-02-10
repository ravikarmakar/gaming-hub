import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "../Footer";
import { Suspense } from "react";
import LoadingSpinner from "../LoadingSpinner";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-purple-500/30">
      <Navbar />
      <main className="flex-grow relative">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
