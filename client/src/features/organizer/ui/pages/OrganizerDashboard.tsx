import React, { useEffect, useMemo } from "react";
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ExternalLink,
  PlusCircle,
  Eye,
  Gamepad2,
  ListOrdered,
  Loader2,
  BarChart,
  Settings,
  Mail,
  Tag,
  Info,
  Briefcase
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { Link } from "react-router-dom";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const OrganizerDashboard = () => {
  const { user } = useAuthStore();
  const { getDashboardStats, dashboardData, isLoading } = useOrganizerStore();

  useEffect(() => {
    getDashboardStats();
  }, [getDashboardStats]);

  const stats = useMemo(() => dashboardData?.stats || {
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    totalPrizeMoney: 0
  }, [dashboardData]);

  const recentEvents = useMemo(() => dashboardData?.recentEvents || [], [dashboardData]);
  const recentActivities = useMemo(() => dashboardData?.recentActivities || [], [dashboardData]);
  const orgInfo = useMemo(() => dashboardData?.org || null, [dashboardData]);

  const quickActions = [
    { label: "Create Event", icon: PlusCircle, link: ORGANIZER_ROUTES.ADD_TOURNAMENTS, color: "text-green-400" },
    { label: "Members", icon: Users, link: ORGANIZER_ROUTES.MEMBERS, color: "text-blue-400" },
    { label: "View Analytics", icon: BarChart, link: ORGANIZER_ROUTES.ANALYTICS, color: "text-purple-400" },
    { label: "Manage Org", icon: Settings, link: ORGANIZER_ROUTES.SETTINGS, color: "text-gray-400" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "registration-open":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
        </div>
        <p className="text-gray-400 font-medium animate-pulse">Synchronizing dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Section: Welcome & Org Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 p-8 bg-[#0B0C1A] border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 transition-transform duration-700 opacity-5 -mr-12 -mt-12 group-hover:scale-125 group-hover:-rotate-12 group-hover:opacity-10">
            <Trophy size={200} className="text-purple-500" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
                Organizer Dashboard
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Hello, <span className="text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text">{user?.username}</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              Manage your tournaments, track participants, and grow your esports community from one centralized command center.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-8 bg-[#0B0C1A] border border-white/5 rounded-2xl flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 border-4 border-purple-500/20 shadow-2xl mb-4">
            <AvatarImage src={orgInfo?.imageUrl} />
            <AvatarFallback className="bg-purple-500/10 text-purple-400 text-2xl font-bold">
              {orgInfo?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold text-white mb-1">{orgInfo?.name || "Organization Name"}</h2>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-400">
              <Tag className="w-3 h-3 mr-1" /> {orgInfo?.tag}
            </Badge>
            {orgInfo?.isVerified && (
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Verified</Badge>
            )}
            {orgInfo?.isHiring && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Briefcase className="size-3 mr-1" /> Hiring
              </Badge>
            )}
          </div>

          <div className="w-full space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
              <span className="text-gray-300 truncate max-w-[150px]">{orgInfo?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created</span>
              <span className="text-gray-300">{orgInfo?.createdAt ? new Date(orgInfo.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          title="All Events"
          value={stats.totalEvents}
          color="text-amber-400"
          gradient="from-amber-500/20 to-transparent"
        />
        <StatCard
          icon={Clock}
          title="Active / Upcoming"
          value={stats.upcomingEvents}
          color="text-blue-400"
          gradient="from-blue-500/20 to-transparent"
        />
        <StatCard
          icon={Users}
          title="Registrations"
          value={stats.totalParticipants}
          color="text-emerald-400"
          gradient="from-emerald-500/20 to-transparent"
        />
        <StatCard
          icon={DollarSign}
          title="Total Prize Pool"
          value={`$${stats.totalPrizeMoney.toLocaleString()}`}
          color="text-purple-400"
          gradient="from-purple-500/20 to-transparent"
        />
      </div>

      {/* Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <ListOrdered className="text-purple-500 w-6 h-6" /> Recent Events
            </h2>
            <Link to={ORGANIZER_ROUTES.TOURNAMENTS} className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              Explore All <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentEvents.length === 0 ? (
              <div className="p-12 text-center bg-[#0B0C1A] border border-dashed border-white/10 rounded-2xl">
                <Gamepad2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400">No events created yet. Start your first tournament!</p>
              </div>
            ) : (
              recentEvents.map((event: any) => (
                <div
                  key={event._id}
                  className="p-5 bg-[#0B0C1A] border border-white/5 hover:border-purple-500/30 rounded-2xl transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="relative w-full sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <img src={event.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate text-lg">{event.title}</h3>
                        <Badge variant="outline" className={`${getStatusColor(event.status)} whitespace-nowrap`}>
                          {event.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Gamepad2 className="w-3.5 h-3.5" />{event.game}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(event.startDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><DollarSign className="w-3.5 h-3.5" />${event.prizePool.toLocaleString()}</span>
                      </div>
                    </div>

                    <Link to={`/organizer/events/${event._id}`} className="w-full sm:w-auto p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-purple-400 transition-all flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Side Content: Quick Actions & Activity */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="text-purple-500 w-5 h-5" /> Quick Access
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.link}
                  className="p-5 bg-[#0B0C1A] border border-white/5 hover:border-purple-500/30 rounded-2xl transition-all group flex flex-col items-center text-center"
                >
                  <div className={`p-3 rounded-2xl bg-white/5 group-hover:bg-purple-500/10 mb-3 transition-colors ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 bg-[#0B0C1A] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <Info className="text-purple-500 w-5 h-5" /> Activity Log
            </h3>
            <div className="space-y-6 relative ml-2">
              <div className="absolute left-0 top-1 bottom-1 w-px bg-white/5" />
              {recentActivities.map((activity: any, idx: number) => (
                <div key={idx} className="relative pl-6 space-y-1">
                  <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  <p className="text-sm font-bold text-gray-300 leading-tight">
                    {activity.type}: <span className="text-gray-500 font-medium">{activity.description}</span>
                  </p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;

// Reusable StatCard Component
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  color: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  color,
  gradient
}) => {
  return (
    <div className={`p-6 bg-[#0B0C1A] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/5 ${color} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};
