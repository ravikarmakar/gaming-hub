import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Gamepad2, Bell } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  ORG_ADMIN_ROLES,
  PLATFORM_SUPER_ADMIN_ROLES,
  SCOPES,
} from "@/lib/roles";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { hasAnyRole } from "@/lib/permissions";
import NavItems from "./shared/NavItems";
import ProfileMenu from "./shared/ProfileMenu";
import { DashboardButton } from "./shared/DashboardButton";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useNotificationStore } from "@/features/notifications/store/useNotificationStore";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isLoading } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSuperAdmin = hasAnyRole(
    user,
    SCOPES.PLATFORM,
    PLATFORM_SUPER_ADMIN_ROLES
  );
  const hasAnyOrgRole = hasAnyRole(user, SCOPES.ORG, ORG_ADMIN_ROLES);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed z-50 w-full font-sans transition-all duration-500 ease-in-out border-b",
        scrolled
          ? "bg-[#0a0514]/80 backdrop-blur-xl border-purple-500/20 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-transparent py-4"
      )}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link to={ROUTES.HOME} className="group relative flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <img
                  src="/logo.svg"
                  alt="Nexus Logo"
                  className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="hidden sm:block text-xl font-bold tracking-tighter text-white">
                NEXUS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            <NavItems />
          </div>

          {/* Right side Actions */}
          <div className="flex items-center gap-3">
            {user?.canCreateOrg && (
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.CREATE_ORG)}
                className="hidden lg:flex relative overflow-hidden group px-4 py-2 text-sm font-semibold text-purple-200 hover:text-white transition-colors"
                disabled={isLoading}
              >
                <span className="relative z-10">Create Org</span>
                <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-purple-600/20 transition-colors" />
              </Button>
            )}

            <div className="hidden sm:flex items-center gap-2">
              <DashboardButton
                isSuperAdmin={isSuperAdmin}
                hasAnyOrgRole={hasAnyOrgRole}
                isLoading={isLoading}
                user={user}
              />
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <Link
                  to={ROUTES.NOTIFICATIONS}
                  className="relative p-2 text-purple-200 hover:text-white hover:bg-purple-500/10 transition-all rounded-full group"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white border-2 border-[#0a0514] animate-in zoom-in duration-300">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0514] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
              <ProfileMenu />

              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative w-10 h-10 text-purple-200 hover:text-white hover:bg-purple-500/10 transition-all rounded-full"
                    >
                      <Menu className="w-6 h-6" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full sm:max-w-sm bg-[#0a0514] border-l border-purple-500/20 p-0 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)]" />

                    <SheetHeader className="p-6 border-b border-purple-500/10">
                      <SheetTitle className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
                        <Gamepad2 className="w-8 h-8 text-purple-500" />
                        NEXUS
                      </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col h-full p-6 space-y-8 relative z-10">
                      {user && (
                        <div className="flex items-center p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 shadow-inner">
                          <Avatar className="w-12 h-12 border-2 border-purple-500/20 shadow-lg">
                            <AvatarImage
                              src={user.avatar || "/api/placeholder/48/48"}
                              alt={user.username}
                            />
                            <AvatarFallback className="bg-purple-900/50 text-purple-200 text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4 overflow-hidden">
                            <p className="text-base font-bold text-white truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-purple-400/80 truncate font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      )}

                      <nav className="flex flex-col gap-2">
                        <NavItems />
                      </nav>

                      <div className="flex flex-col gap-3 pt-4 border-t border-purple-500/10">
                        <DashboardButton
                          isSuperAdmin={isSuperAdmin}
                          hasAnyOrgRole={hasAnyOrgRole}
                          isLoading={isLoading}
                          user={user}
                        />

                        {!user && !isLoading && (
                          <Button
                            onClick={() => {
                              navigate(ROUTES.LOGIN);
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300"
                          >
                            Get Started
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
