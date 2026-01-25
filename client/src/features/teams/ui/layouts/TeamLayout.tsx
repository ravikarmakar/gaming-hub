import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  Users,
  UserPlus,
  Trophy,
  Settings,
  BarChart2,
  Bell,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { DashboardNavbar } from "@/features/dashboard/ui/components/DashboardNavbar";
import { DashboardSidebar } from "@/features/dashboard/ui/components/DashboardSidebar";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { TEAM_ACCESS } from "@/features/teams/lib/access";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const teamSidebarLinks = [
  {
    label: "Team Overview",
    icon: Users,
    href: TEAM_ROUTES.DASHBOARD,
    access: TEAM_ACCESS.dashboard,
  },
  {
    label: "Team Members",
    icon: UserPlus,
    href: TEAM_ROUTES.MEMBERS,
    access: TEAM_ACCESS.members,
  },
  {
    label: "Team Performance",
    icon: BarChart2,
    href: TEAM_ROUTES.PERFORMANCE,
  },
  {
    label: "Tournaments Played",
    icon: Trophy,
    href: TEAM_ROUTES.TOURNAMENTS,
  },
  {
    label: "Team Notifications",
    icon: Bell,
    href: TEAM_ROUTES.NOTIFICATIONS,
  },
  {
    label: "Staff Management",
    icon: Settings,
    href: TEAM_ROUTES.STAFF,
    access: TEAM_ACCESS.staff,
  },
  {
    label: "Team Settings",
    icon: Settings,
    href: TEAM_ROUTES.SETTINGS,
    access: TEAM_ACCESS.settings,
  },

];

const TeamLayout = () => {
  const { can } = useAccess();
  const { user, checkingAuth } = useAuthStore();

  const filteredLinks = useMemo(() => {
    return teamSidebarLinks.filter((link) => {
      if (!link.access) return true;
      return can(link.access);
    });
  }, [can]);

  if (checkingAuth) {
    return (
      <div className="w-screen h-screen bg-[#0a0514] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.teamId) {
    return <Navigate to="/" replace />;
  }
  // Note: can() automatically resolves scopeId for SCOPES.TEAM from user.teamId
  if (!can(TEAM_ACCESS.dashboard)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <DashboardSidebar sidebarItems={filteredLinks} />
      <main className="flex flex-col w-screen h-screen bg-[#0a0514] overflow-hidden">
        <DashboardNavbar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default TeamLayout;
