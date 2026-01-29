import { useEffect, createContext, useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutContextType {
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
}

const AuthLayoutContext = createContext<AuthLayoutContextType | undefined>(undefined);

export const useAuthLayout = () => {
  const context = useContext(AuthLayoutContext);
  if (!context) {
    throw new Error("useAuthLayout must be used within an AuthLayoutProvider");
  }
  return context;
};

export default function AuthLayout() {
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthLayoutContext.Provider value={{ setTitle, setSubtitle }}>
      <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/auth-bg.png"
            alt="Gaming Background"
            className="object-cover w-full h-full opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-purple-900/10 mix-blend-overlay" />
        </div>

        {/* Main container */}
        <div className="relative z-10 w-full max-w-[440px] px-4 mx-auto py-10">
          <Card className="backdrop-blur-xl bg-gray-900/40 border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-2xl">
            {/* Header Accent */}
            <div className="h-1 bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900" />

            <CardHeader className="pt-8 pb-4">
              <div className="space-y-1 text-center">
                <CardTitle className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl transition-all duration-300">
                  {title}
                </CardTitle>
                <p className="text-gray-400 text-sm sm:text-base font-medium transition-all duration-300">
                  {subtitle}
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-10">
              {/* Content area */}
              <div className="relative">
                <Outlet />
              </div>
            </CardContent>
          </Card>

          {/* Footer text */}
          <p className="mt-8 text-xs text-center text-gray-600">
            © {new Date().getFullYear()} GameVerse. All rights reserved.
          </p>
        </div>
      </div>
    </AuthLayoutContext.Provider>
  );
}