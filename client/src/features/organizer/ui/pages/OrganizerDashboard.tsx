import { useEffect, useMemo } from "react";
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
  BarChart,
  Settings,
  Mail,
  Tag,
  Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { EVENT_ROUTES } from "@/features/events/lib/routes";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GlassCard,
  MetricCard,
  NeonBadge,
  SectionHeader
} from "@/features/events/ui/components/ThemedComponents";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const OrganizerDashboard = () => {
  const { user } = useAuthStore();
  const { getDashboardStats, dashboardData } = useOrganizerStore();

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
  const orgInfo = useMemo(() => dashboardData?.org || null, [dashboardData]);

  const quickActions = [
    { label: "Create Event", icon: PlusCircle, link: ORGANIZER_ROUTES.ADD_TOURNAMENTS, color: "text-emerald-400" },
    { label: "Members", icon: Users, link: ORGANIZER_ROUTES.MEMBERS, color: "text-blue-400" },
    { label: "Analytics", icon: BarChart, link: ORGANIZER_ROUTES.ANALYTICS, color: "text-purple-400" },
    { label: "Settings", icon: Settings, link: ORGANIZER_ROUTES.SETTINGS, color: "text-gray-400" },
  ];



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Section: Welcome & Org Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <GlassCard className="lg:col-span-2 p-8 relative overflow-hidden group border-purple-500/10" gradient>
          <div className="absolute top-0 right-0 p-12 transition-transform duration-1000 opacity-5 -mr-12 -mt-12 group-hover:scale-110 group-hover:-rotate-12">
            <Trophy size={200} className="text-purple-500" />
          </div>

          <div className="relative z-10">
            <div className="mb-6">
              <NeonBadge variant="purple">Organizer Dashboard</NeonBadge>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tighter">
              Hello, <span className="text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text drop-shadow-sm">{user?.username}</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed font-medium">
              Manage your tournaments, track participants, and grow your esports community from one centralized command center.
            </p>
          </div>
        </GlassCard>

        {/* Profile Card */}
        <GlassCard className="p-8 flex flex-col items-center text-center border-purple-500/10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
            <Avatar className="w-24 h-24 border-2 border-purple-500/20 relative z-10">
              <AvatarImage src={orgInfo?.imageUrl} />
              <AvatarFallback className="bg-purple-500/10 text-purple-400 text-2xl font-bold">
                {orgInfo?.name?.[0] || user?.username?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{orgInfo?.name || "Organization"}</h2>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <NeonBadge variant="purple" className="flex items-center gap-1.5 lowercase">
              <Tag size={10} /> {orgInfo?.tag || "@org"}
            </NeonBadge>
            {orgInfo?.isHiring && (
              <NeonBadge variant="green" className="flex items-center gap-1.5 h-auto">
                <Briefcase size={10} /> Hiring
              </NeonBadge>
            )}
          </div>

          <div className="w-full space-y-4 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                <Mail size={12} /> Email
              </span>
              <span className="text-gray-300 font-medium truncate max-w-[150px]">{orgInfo?.email || user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                <Calendar size={12} /> Created
              </span>
              <span className="text-gray-300 font-medium">
                {orgInfo?.createdAt ? new Date(orgInfo.createdAt).toLocaleDateString() : 'Jan 20, 2026'}
              </span>
            </div>
          </div>
        </GlassCard>
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
                Explore All <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 gap-4">
            {recentEvents.length === 0 ? (
              <GlassCard className="p-16 text-center border-dashed">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gamepad2 className="w-8 h-8 text-gray-700" />
                </div>
                <p className="text-gray-400 font-medium">No active arenas found. Start your first tournament!</p>
                <Link to={ORGANIZER_ROUTES.ADD_TOURNAMENTS} className="mt-6 inline-flex items-center gap-2 text-purple-400 font-bold hover:underline">
                  Create Arena <PlusCircle size={16} />
                </Link>
              </GlassCard>
            ) : (
              recentEvents.map((event: any, index: number) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 group border-purple-500/5 hover:border-purple-500/20">
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      <div className="relative w-full sm:w-24 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img src={event.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1A]/80 to-transparent" />
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate text-lg tracking-tight">{event.title}</h3>
                          <NeonBadge variant={event.registrationStatus === "registration-open" ? "blue" : event.registrationStatus === "live" ? "red" : "green"}>
                            {(event.registrationStatus || "unknown").replace('-', ' ')}
                          </NeonBadge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Gamepad2 size={12} className="text-purple-400" />{event.game}</span>
                          <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Calendar size={12} className="text-blue-400" />{new Date(event.startDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-2 uppercase tracking-widest text-[10px] text-emerald-400 font-bold"><DollarSign size={12} />${event.prizePool.toLocaleString()}</span>
                        </div>
                      </div>

                      <Link to={EVENT_ROUTES.TOURNAMENT_DETAILS.replace(':id', event._id)} className="w-full sm:w-auto p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-purple-400 transition-all flex items-center justify-center group/view">
                        <Eye size={18} className="transition-transform group-hover/view:scale-110 shadow-glow" />
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Side Content: Quick Access */}
        <div className="space-y-8">
          <SectionHeader
            title="Quick Access"
            icon={TrendingUp}
          />
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
              >
                <Link
                  to={action.link}
                  className="group"
                >
                  <GlassCard className="p-6 h-full flex flex-col items-center text-center hover:border-purple-500/30 transition-all">
                    <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:bg-purple-500/10 mb-4 transition-all duration-300 group-hover:scale-110", action.color)}>
                      <action.icon size={28} />
                    </div>
                    <span className="hidden sm:block text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors">{action.label}</span>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Activity Mini Log */}
          <GlassCard className="p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              Recent Ops Log
            </h3>
            <div className="space-y-6 relative ml-1">
              <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-white/5" />
              {[
                { type: "Event", desc: "CS2 Championship Created", time: "2H AGO" },
                { type: "System", desc: "Prize Distribution Updated", time: "5H AGO" },
                { type: "Team", desc: "Navi Joined Winter Cup", time: "1D AGO" },
              ].map((activity, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute left-[-2.5px] top-1.5 w-[5px] h-[5px] rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-tight">
                      {activity.type}: <span className="text-gray-500 normal-case font-medium">{activity.desc}</span>
                    </p>
                    <p className="text-[9px] text-gray-600 font-bold">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
