import { useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import {
  Users,
  UserPlus,
  Trophy,
  Settings,
  Bell,
  MessageSquare,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { DashboardNavbar } from "@/features/dashboard/ui/components/DashboardNavbar";
import { DashboardSidebar } from "@/features/dashboard/ui/components/DashboardSidebar";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { TEAM_ACCESS } from "@/features/teams/lib/access";
import { useFilteredNavigation } from "@/hooks/useFilteredNavigation";
import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TeamLoading } from "../components/TeamLoading";
import { TeamError } from "../components/TeamError";
import { useTeamRoom, useSocketEvent } from "@/hooks/useSocket";

const teamSidebarLinks = [
  {
    label: "Overview",
    icon: Users,
    href: TEAM_ROUTES.DASHBOARD,
    access: TEAM_ACCESS.dashboard,
  },
  {
    label: "Active Roster",
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
    label: "Notifications",
    icon: Bell,
    href: TEAM_ROUTES.NOTIFICATIONS,
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: TEAM_ROUTES.CHAT,
  },
  {
    label: "Settings",
    icon: Settings,
    href: TEAM_ROUTES.SETTINGS,
    access: TEAM_ACCESS.settings,
  },
];

const TeamLayout = () => {
  const filteredLinks = useFilteredNavigation(teamSidebarLinks);
  const user = useAuthStore((state) => state.user);
  const teamId = typeof user?.teamId === 'string' ? user.teamId : user?.teamId?._id;

  const getTeamById = useTeamManagementStore((state) => state.getTeamById);
  const isLoading = useTeamManagementStore((state) => state.isLoading);
  const error = useTeamManagementStore((state) => state.error);
  const currentTeam = useTeamManagementStore((state) => state.currentTeam);
  const clearError = useTeamManagementStore((state) => state.clearError);

  // Join team room via WebSocket
  useTeamRoom(teamId);

  // Stable socket handlers to prevent listener churn
  const refreshTeamData = useCallback(async () => {
    if (teamId) {
      await getTeamById(teamId, true, true);
    }
  }, [teamId, getTeamById]);

  const handleMemberLeft = useCallback(async () => {
    const currentTeamState = useTeamManagementStore.getState().currentTeam;
    if (teamId && currentTeamState) {
      await getTeamById(teamId, true, true);
    }
  }, [teamId, getTeamById]);

  const handleTeamUpdated = useCallback(() => {
    if (teamId) {
      getTeamById(teamId, true, true);
    }
  }, [teamId, getTeamById]);

  // Listen for real-time team updates
  useSocketEvent("team:member:joined", refreshTeamData);
  useSocketEvent("team:member:left", handleMemberLeft);
  useSocketEvent("team:role:updated", refreshTeamData);
  useSocketEvent("team:owner:transferred", handleMemberLeft);
  useSocketEvent("team:deleted", refreshTeamData);
  useSocketEvent("team:updated", handleTeamUpdated);

  useEffect(() => {
    // String comparison for IDs to avoid reference issues
    const isDifferentTeam = currentTeam?._id?.toString() !== teamId?.toString();

    if (teamId && (!currentTeam || isDifferentTeam)) {
      getTeamById(teamId, true);
    }

    const handleFocus = () => {
      if (teamId) getTeamById(teamId, true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearError();
    };
  }, [teamId, currentTeam?._id, getTeamById, clearError]);

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
                onRetry={() => teamId && getTeamById(teamId)}
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
