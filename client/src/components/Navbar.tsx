import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Gamepad2 } from "lucide-react";

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

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSuperAdmin = hasAnyRole(
    user,
    SCOPES.PLATFORM,
    PLATFORM_SUPER_ADMIN_ROLES
  );
  const hasAnyOrgRole = hasAnyRole(user, SCOPES.ORG, ORG_ADMIN_ROLES);

  return (
    <nav
      className={cn(
        "fixed z-50 w-full font-sans transition-all duration-300 ease-in-out border-b backdrop-blur-md",
        scrolled
          ? "bg-gray-950/90 border-purple-900/50 shadow-lg shadow-purple-900/10"
          : "bg-transparent border-transparent shadow-none"
      )}
    >
      <div className="px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center">
              <img
                src="/logo.svg"
                alt="Nexus Logo"
                className="w-8 h-8"
                loading="lazy"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <NavItems />
          </div>

          {/* Right side - Dashboard, Profile and Login */}
          <div className="flex items-center">
            {/* Request button to create org */}
            {user?.canCreateOrg && (
              <Button
                onClick={() => navigate(ROUTES.CREATE_ORG)}
                className="hidden px-4 py-2 mr-4 text-sm font-medium text-white rounded-md shadow-md md:inline-flex bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 focus-visible:ring-purple-900 shadow-purple-900/20"
                disabled={isLoading}
              >
                Create Org
              </Button>
            )}

            <DashboardButton
              isSuperAdmin={isSuperAdmin}
              hasAnyOrgRole={hasAnyOrgRole}
              isLoading={isLoading}
              user={user!}
            />

            {/* Profile Icon */}
            <ProfileMenu />

            {/* Mobile Menu Button (Sheet Trigger) */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 text-gray-300 rounded-md hover:text-white focus-visible:ring-purple-700"
                  >
                    <Menu className="w-8 h-8" />
                    <span className="sr-only">Toggle mobile menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full text-white bg-gray-900 border-r sm:max-w-xs border-purple-900/50"
                >
                  <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                      <Gamepad2 className="w-8 h-8 mr-2 text-purple-400" />
                      NEXUS
                    </SheetTitle>
                  </SheetHeader>

                  {/* Mobile Menu Content */}
                  <div className="flex flex-col h-full overflow-y-auto">
                    {user ? (
                      <div className="flex items-center p-3 mb-2 border-b border-gray-800">
                        <Avatar className="w-10 h-10 mr-3 border-2 border-purple-500">
                          <AvatarImage
                            src={user.avatar || "/api/placeholder/40/40"}
                            alt={user.username}
                          />
                          <AvatarFallback className="text-sm font-semibold text-gray-300 bg-gray-700">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Mobile Navigation Links */}
                    <nav className="flex-1 space-y-1">
                      <NavItems />
                    </nav>

                    {/* Mobile Dashboard Button (if applicable) */}
                    <DashboardButton
                      isSuperAdmin={isSuperAdmin}
                      hasAnyOrgRole={hasAnyOrgRole}
                      isLoading={isLoading}
                      user={user!}
                    />

                    {/* Mobile Login Button (if applicable) */}
                    {!user || isLoading ? (
                      <Button
                        onClick={() => {
                          navigate(ROUTES.LOGIN);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 mt-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 focus-visible:ring-purple-900 shadow-md shadow-purple-900/20`}
                      >
                        Login
                      </Button>
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
