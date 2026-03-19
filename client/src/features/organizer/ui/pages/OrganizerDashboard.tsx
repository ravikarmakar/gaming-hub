import { useMemo } from "react";
import {
  Trophy,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  ListOrdered,
  BarChart,
  Settings,
  PlusCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useOrgDashboardStatsQuery } from "../../hooks/useOrganizerQueries";
import {
  MetricCard,
  SectionHeader
} from "@/features/tournaments/ui/components/shared/ThemedComponents";

// Extracted sub-components
import { DashboardWelcome } from "../components/dashboard/DashboardWelcome";
import { DashboardProfile } from "../components/dashboard/DashboardProfile";
import { RecentArenas } from "../components/dashboard/RecentArenas";
import { QuickAccess } from "../components/dashboard/QuickAccess";
import { ActivityLog } from "../components/dashboard/ActivityLog";

export const OrganizerDashboard = () => {
  const { user } = useAuthStore();
  const orgId = user?.orgId;

  const { data: dashboardData } = useOrgDashboardStatsQuery(orgId as string);

  const stats = useMemo(() => dashboardData?.stats || {
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    totalPrizeMoney: 0
  }, [dashboardData]);

  const recentEvents = useMemo(() => dashboardData?.recentEvents || [], [dashboardData]);
  const orgInfo = useMemo(() => dashboardData?.org || null, [dashboardData]);

  const quickActions = [
    { label: "Create Event", icon: PlusCircle, link: ORGANIZER_ROUTES.ADD_TOURNAMENTS, color: "text-emerald-400" },
    { label: "Members", icon: Users, link: ORGANIZER_ROUTES.MEMBERS, color: "text-blue-400" },
    { label: "Analytics", icon: BarChart, link: ORGANIZER_ROUTES.ANALYTICS, color: "text-purple-400" },
    { label: "Settings", icon: Settings, link: ORGANIZER_ROUTES.SETTINGS, color: "text-gray-400" },
  ];

  const recentActivities = [
    { type: "Event", desc: "CS2 Championship Created", time: "2H AGO" },
    { type: "System", desc: "Prize Distribution Updated", time: "5H AGO" },
    { type: "Team", desc: "Navi Joined Winter Cup", time: "1D AGO" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Section: Welcome & Org Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardWelcome username={user?.username} />
        <DashboardProfile orgInfo={orgInfo} fallbackName={user?.username} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Trophy}
          title="All Events"
          value={stats.totalEvents}
          color="text-amber-400"
          className="border-amber-500/10 hover:border-amber-500/20"
        />
        <MetricCard
          icon={Clock}
          title="Active / Upcoming"
          value={stats.upcomingEvents}
          color="text-blue-400"
          className="border-blue-500/10 hover:border-blue-500/20"
        />
        <MetricCard
          icon={Users}
          title="Registrations"
          value={stats.totalParticipants}
          color="text-emerald-400"
          className="border-emerald-500/10 hover:border-emerald-500/20"
        />
        <MetricCard
          icon={DollarSign}
          title="Total Prize Pool"
          value={`$${stats.totalPrizeMoney.toLocaleString()}`}
          color="text-purple-400"
          className="border-purple-500/10 hover:border-purple-500/20"
        />
      </div>

      {/* Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events List */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader
            title="Recent Arena Activities"
            icon={ListOrdered}
            action={
              <Link to={ORGANIZER_ROUTES.TOURNAMENTS} className="group flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors">
                Explore All <span className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </Link>
            }
          />
          <RecentArenas events={recentEvents} />
        </div>

        {/* Side Content: Quick Access & Logs */}
        <div className="space-y-8">
          <SectionHeader
            title="Quick Access"
            icon={TrendingUp}
          />
          <QuickAccess actions={quickActions} />
          <ActivityLog activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
