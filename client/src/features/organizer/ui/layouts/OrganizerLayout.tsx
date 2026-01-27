import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  Users,
  Trophy,
  BarChart2,
  Bell,
  LayoutDashboard,
  PlusCircle,
  Settings,
  UserPlus,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/features/dashboard/ui/components/DashboardNavbar";
import { DashboardSidebar } from "@/features/dashboard/ui/components/DashboardSidebar";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { ORG_ACCESS } from "@/features/organizer/lib/access";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const organizerSidebarLinks = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: ORGANIZER_ROUTES.DASHBOARD,
    access: ORG_ACCESS.dashboard,
  },
  {
    label: "Members",
    icon: Users,
    href: ORGANIZER_ROUTES.MEMBERS,
    access: ORG_ACCESS.members,
  },
  {
    label: "Join Requests",
    icon: UserPlus,
    href: ORGANIZER_ROUTES.JOIN_REQUESTS,
    access: ORG_ACCESS.joinRequests,
  },
  {
    label: "Tournaments",
    icon: Trophy,
    href: ORGANIZER_ROUTES.TOURNAMENTS,
    access: ORG_ACCESS.tournaments,
  },
  {
    label: "Add Tournaments",
    icon: PlusCircle,
    href: ORGANIZER_ROUTES.ADD_TOURNAMENTS,
    matches: [ORGANIZER_ROUTES.EDIT_TOURNAMENT],
    access: ORG_ACCESS.createTournament,
  },
  {
    label: "Analytics",
    icon: BarChart2,
    href: ORGANIZER_ROUTES.ANALYTICS,
    access: ORG_ACCESS.analytics,
  },
  {
    label: "Notifications",
    icon: Bell,
    href: ORGANIZER_ROUTES.NOTIFICATIONS,
    access: ORG_ACCESS.notifications,
  },
  {
    label: "Settings",
    icon: Settings,
    href: ORGANIZER_ROUTES.SETTINGS,
    access: ORG_ACCESS.settings,
  },
];

const OrganizerLayout = () => {
  const { can } = useAccess();
  const { user, checkingAuth } = useAuthStore();

  const filteredLinks = useMemo(() => {
    return organizerSidebarLinks.filter((link) => {
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

  if (!user?.orgId) {
    return <Navigate to="/" replace />;
  }

  if (!can(ORG_ACCESS.dashboard)) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <DashboardSidebar sidebarItems={filteredLinks} />
      <main className="flex flex-col w-screen h-screen bg-[#0a0514] overflow-hidden">
        <DashboardNavbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default OrganizerLayout;
