import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Users, UserPlus, Trophy, Settings, Bell, MessageSquare, } from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { DashboardNavbar } from "@/features/dashboard/ui/components/DashboardNavbar";
import { DashboardSidebar } from "@/features/dashboard/ui/components/DashboardSidebar";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { useFilteredNavigation } from "@/hooks/useFilteredNavigation";
import { useCurrentUser } from "@/features/auth";
import { TeamDialogProvider } from "@/features/teams/context/TeamDialogContext";
import { TeamDialogOrchestrator } from "@/features/teams/ui/components/dialogs/TeamDialogOrchestrator";
import { TeamDashboardProvider } from "@/features/teams/context/TeamDashboardContext";
import { useGetTeamByIdQuery } from "@/features/teams/hooks/useTeamQueries";
import { useTeamSocket } from "@/features/teams/hooks/useTeamSocket";
import { TEAM_ACCESS } from "@/features/teams/lib/access";

// Removed unused cn import

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
  const { user } = useCurrentUser();
  const teamId = typeof user?.teamId === 'string' ? user.teamId : user?.teamId?._id;

  const {
    refetch
  } = useGetTeamByIdQuery(teamId || "", false, {
    enabled: !!teamId,
  });
  // Centralized Team Socket Management (Room + Events)
  useTeamSocket(teamId);



  useEffect(() => {
    if (!teamId) return;

    const handleFocus = () => {
      refetch();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [teamId, refetch]);

  return (
    <SidebarProvider>
      <DashboardSidebar sidebarItems={filteredLinks} />
      <main className="flex flex-col w-screen h-screen bg-brand-black overflow-hidden relative text-white">
        {/* Universal Background FX */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none z-0" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col h-full">
          <DashboardNavbar />
          <TeamDashboardProvider teamId={teamId || ""} userId={user?._id}>
            <TeamDialogProvider>
              <div className="flex-1 overflow-hidden min-h-0 p-0">
                <Outlet />
              </div>
              <TeamDialogOrchestrator />
            </TeamDialogProvider>
          </TeamDashboardProvider>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default TeamLayout;
