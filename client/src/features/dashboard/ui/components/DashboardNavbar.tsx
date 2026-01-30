import { useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import ProfileMenu from "@/components/shared/ProfileMenu";
import {
  Search,
  Slash,
  Plus,
  Shield,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Map routes to human-readable names
const ROUTE_NAME_MAP: Record<string, string> = {
  "dashboard": "Dashboard",
  "organizer": "Organizer",
  "team": "Team",
  "tournaments": "Tournaments",
  "add-tournaments": "Create",
  "edit-tournament": "Edit",
  "members": "Members",
  "settings": "Settings",
  "analytics": "Analytics",
  "notifications": "Inbox",
  "join-requests": "Requests",
  "profile": "Profile",
};

export const DashboardNavbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  // Generate breadcrumbs from path
  const pathSegments = pathname.split('/').filter(Boolean);

  // Custom breadcrumb logic
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Handle dynamic segments (IDs)
    if (segment.length > 20 || segment.includes('-') && /\d/.test(segment)) {
      return { label: "Details", href: "" }; // Fallback for IDs
    }

    // Build href for this segment
    let href = '/' + pathSegments.slice(0, index + 1).join('/');

    // Fix for "Dashboard" segment pointing to invalid /dashboard route
    if (segment === 'dashboard') {
      return { label: "Dashboard", href: "" }; // Make it non-clickable
    }

    return {
      label: ROUTE_NAME_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href
    };
  });

  // Determine context color
  const isOrganizer = pathname.includes('/organizer');
  const isTeam = pathname.includes('/team');
  const accentColor = isOrganizer ? "text-purple-400" : isTeam ? "text-blue-400" : "text-green-400";

  // Determine User Role in current context
  const getRoleBadge = () => {
    if (!user) return null;

    if (isOrganizer) {
      const orgRole = user.roles.find((r) => r.scope === "org");
      if (orgRole) {
        const displayRole = orgRole.role.split(':').pop();
        const formattedRole = displayRole ? displayRole.charAt(0).toUpperCase() + displayRole.slice(1) : "Member";

        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1.5 hidden sm:inline-flex items-center px-2 py-1 h-7">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-medium">{formattedRole}</span>
          </Badge>
        );
      }
    }

    if (isTeam) {
      const teamRole = user.roles.find((r) => r.scope === "team");
      if (teamRole) {
        const displayRole = teamRole.role.split(':').pop();
        const formattedRole = displayRole ? displayRole.charAt(0).toUpperCase() + displayRole.slice(1) : "Player";

        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1.5 hidden sm:inline-flex items-center px-2 py-1 h-7">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">{formattedRole}</span>
          </Badge>
        );
      }
    }

    return null;
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0514]/80 border-b border-white/5 transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-6 gap-4">

        {/* Left: Breadcrumbs & Context */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center text-sm text-gray-400 font-medium">
            <Link
              to={ROUTES.HOME}
              className="hover:text-white transition-colors flex items-center gap-2"
            >
              <div className={cn("w-2 h-2 rounded-full", isOrganizer ? "bg-purple-500" : "bg-blue-500")}></div>
              <span className="hidden sm:inline">Home</span>
            </Link>

            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center">
                <Slash className="w-3 h-3 mx-2 text-gray-700 -rotate-12" />
                {i === breadcrumbs.length - 1 ? (
                  <span className={cn("text-white font-semibold truncate max-w-[150px]", accentColor)}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-gray-200 transition-colors truncate max-w-[100px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Global Search (Command Center) */}
        <div className="hidden md:flex flex-1 max-w-md items-center justify-center">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
            <Input
              placeholder="Search tournaments, teams, players..."
              className="w-full bg-[#130b24] border-white/5 rounded-full pl-10 pr-12 h-10 text-sm focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all placeholder:text-gray-600"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Role Indicator */}
          {getRoleBadge()}

          {/* Quick Action - Only show on relevant pages */}
          {pathname === ORGANIZER_ROUTES.TOURNAMENTS && (
            <Button size="sm" className="hidden sm:flex bg-white text-black hover:bg-gray-200 h-9 gap-2 font-medium">
              <Plus className="w-4 h-4" />
              Create
            </Button>
          )}

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0514]"></span>
          </Button> */}

          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
};