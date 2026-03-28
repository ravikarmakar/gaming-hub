import { Outlet } from "react-router-dom";
import {
  Users,
  Trophy,
  Bell,
  LayoutDashboard,
  PlusCircle,
  Settings,
  UserPlus,
  MessageSquare,
} from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/features/dashboard/ui/components/DashboardNavbar";
import { DashboardSidebar } from "@/features/dashboard/ui/components/DashboardSidebar";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { ORG_ACCESS } from "@/features/organizer/lib/access";
import { useFilteredNavigation } from "@/hooks/useFilteredNavigation";
import { useCurrentUser } from "@/features/auth";
import { useOrganizerSync } from "../../hooks/useOrganizerSync";



const organizerSidebarLinks = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: ORGANIZER_ROUTES.DASHBOARD,
    access: ORG_ACCESS.dashboard,
  },
  {
    label: "Tournaments",
    icon: Trophy,
    href: ORGANIZER_ROUTES.TOURNAMENTS,
    access: ORG_ACCESS.tournaments,
    matches: [
      ORGANIZER_ROUTES.EDIT_TOURNAMENT,
      ORGANIZER_ROUTES.TOURNAMENT_DASHBOARD
    ],
  },
  {
    label: "Add Tournaments",
    icon: PlusCircle,
    href: ORGANIZER_ROUTES.ADD_TOURNAMENTS,
    access: ORG_ACCESS.createTournament,
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
    label: "Chat",
    icon: MessageSquare,
    href: ORGANIZER_ROUTES.CHAT,
    access: ORG_ACCESS.dashboard,
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
  const filteredLinks = useFilteredNavigation(organizerSidebarLinks);

  const { user } = useCurrentUser();
  // 1. Join Socket.IO room & listen to incoming events cleanly
  const orgId = user?.orgId as string;
  useOrganizerSync(orgId);


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
            <Outlet />
          </div>

        </div>
      </main>
    </SidebarProvider>
  );
};

export default OrganizerLayout;
