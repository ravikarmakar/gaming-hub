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
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const teamSidebarLinks = [
  {
    label: "Team Overview",
    icon: Users,
    href: "/dashboard/team",
  },
  {
    label: "Manage Players",
    icon: UserPlus,
    href: "/dashboard/team/players",
  },
  {
    label: "Team Performance",
    icon: BarChart2,
    href: "/dashboard/team/performance",
  },
  {
    label: "Tournaments Played",
    icon: Trophy,
    href: "/dashboard/team/tournaments",
  },
  {
    label: "Team Notifications",
    icon: Bell,
    href: "/dashboard/team/notifications",
  },
  {
    label: "Team Settings",
    icon: Settings,
    href: "/dashboard/team/settings",
  },
];

import { useTeamStore } from "@/features/teams/store/useTeamStore";

const TeamLayout = () => {
  const { user } = useAuthStore();
  const { currentTeam } = useTeamStore();

  if (!user?.teamId) {
    return <Navigate to="/" />;
  }

  const isCaptain = currentTeam?.captain === user?._id;

  const filteredLinks = teamSidebarLinks.filter(link => {
    if (link.label === "Team Settings") {
      return isCaptain;
    }
    return true;
  });

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
