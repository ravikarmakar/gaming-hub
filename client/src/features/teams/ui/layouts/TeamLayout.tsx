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
    label: "Tournaments",
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

const TeamLayout = () => {
  const { user } = useAuthStore();

  if (!user?.teamId) {
    return <Navigate to="/" />;
  }

  return (
    <SidebarProvider>
      <DashboardSidebar sidebarItems={teamSidebarLinks} />
      <main className="flex flex-col w-screen h-screen bg-muted">
        <DashboardNavbar />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default TeamLayout;
