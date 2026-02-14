import { useEffect } from "react";
import { Outlet } from "react-router-dom";
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
import { useFilteredNavigation } from "@/hooks/useFilteredNavigation";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TeamLoading } from "../components/TeamLoading";
import { TeamError } from "../components/TeamError";
import { useTeamRoom, useSocketEvent } from "@/hooks/useSocket";

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
    label: "Staff Management",
    icon: Settings,
    href: TEAM_ROUTES.STAFF,
    access: TEAM_ACCESS.staff,
  },
  {
    label: "Tournaments Played",
    icon: Trophy,
    href: TEAM_ROUTES.TOURNAMENTS,
  },
  {
    label: "Team Performance",
    icon: BarChart2,
    href: TEAM_ROUTES.PERFORMANCE,
  },
  {
    label: "Team Notifications",
    icon: Bell,
    href: TEAM_ROUTES.NOTIFICATIONS,
  },
  {
    label: "Team Settings",
    icon: Settings,
    href: TEAM_ROUTES.SETTINGS,
    access: TEAM_ACCESS.settings,
  },
];

const TeamLayout = () => {
  const filteredLinks = useFilteredNavigation(teamSidebarLinks);
  const { user } = useAuthStore();
  const { getTeamById, isLoading, error, currentTeam, clearError } = useTeamStore();

  // Join team room via WebSocket
  useTeamRoom(user?.teamId);

  // Listen for real-time team updates
  useSocketEvent("team:member:joined", () => {
    console.log("🔔 New member joined, refreshing team data...");
    if (user?.teamId) {
      getTeamById(user.teamId, true);
    }
  });

  useSocketEvent("team:member:left", () => {
    console.log("🔔 Member left, refreshing team data...");
    if (user?.teamId) {
      getTeamById(user.teamId, true);
    }
  });

  useSocketEvent("team:role:updated", () => {
    console.log("🔔 Role updated, refreshing team data...");
    if (user?.teamId) {
      getTeamById(user.teamId, true);
    }
  });

  useSocketEvent("team:owner:transferred", () => {
    console.log("🔔 Ownership transferred, refreshing team data...");
    if (user?.teamId) {
      getTeamById(user.teamId, true);
    }
  });

  useSocketEvent("team:updated", () => {
    console.log("🔔 Team updated, refreshing team data...");
    if (user?.teamId) {
      getTeamById(user.teamId, true);
    }
  });

  useEffect(() => {
    if (user?.teamId) {
      // Initial load only - Socket.IO handles real-time updates
      getTeamById(user.teamId, true);

      // Refetch when user returns to the tab (event-driven)
      const handleFocus = () => {
        getTeamById(user.teamId, true);
      };
      window.addEventListener("focus", handleFocus);

      return () => {
        window.removeEventListener("focus", handleFocus);
        clearError();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.teamId]); // Only refetch when teamId changes, not on every navigation

  return (
    <SidebarProvider>
      <DashboardSidebar sidebarItems={filteredLinks} />
      <main className="flex flex-col w-screen h-screen bg-brand-black overflow-hidden relative text-white">
        {/* Universal Background FX */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none z-0" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col h-full">
          <DashboardNavbar />
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {isLoading && !currentTeam ? (
              <TeamLoading />
            ) : error && !currentTeam ? (
              <TeamError
                message={error}
                onRetry={() => user?.teamId && getTeamById(user.teamId)}
              />
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default TeamLayout;
