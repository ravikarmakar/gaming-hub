import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname.includes("login");
  const isForgotPassword = location.pathname.includes("forgot-password");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
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
      <div className="relative z-10 w-full max-w-sm px-4 mx-auto">
        <Card className="backdrop-blur-xl bg-gray-900/40 border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden rounded-2xl">
          {/* Header Accent */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500" />

          <CardHeader className="pt-8 pb-4">
            {/* Back button */}
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="flex items-center w-fit gap-2 p-0 h-auto mb-6 text-sm text-gray-400 hover:text-white transition-colors group no-underline hover:no-underline"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back</span>
            </Button>

            <div className="space-y-1 text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {isLogin ? "Welcome Back" : isForgotPassword ? "Reset Password" : "Join GameVerse"}
              </CardTitle>
              <p className="text-gray-400 text-sm sm:text-base font-medium">
                {isLogin
                  ? "Ready to continue your gaming journey?"
                  : isForgotPassword
                    ? "Don't worry, we'll help you get back in!"
                    : "Begin your epic gaming adventure today!"}
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-10 sm:px-10">
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
  );
}
