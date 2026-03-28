import { useMemo } from "react";
import { Users, Trophy, Crown, Target, UserPlus, Settings, ArrowRight, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { TeamHeader } from "@/features/teams/ui/components/dashboard/TeamHeader";
import { TeamStatCard } from "@/features/teams/ui/components/stats/TeamStatCard";
import { TeamRecentMatch } from "@/features/teams/ui/components/stats/TeamRecentMatch";
import { TournamentItem } from "@/features/teams/ui/components/dashboard/TournamentItem";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { useTeamDashboard } from "@/features/teams/context/TeamDashboardContext";
import { TeamLoading } from "@/features/teams/ui/components/common/TeamLoading";
import { TeamError } from "@/features/teams/ui/components/common/TeamError";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const TeamDashboardPage = () => {
  const navigate = useNavigate();
  const { team: currentTeam, permissions, isLoading, isError, error, refetch } = useTeamDashboard();

  const stats = currentTeam?.stats;
  const canManageSettings = permissions?.isOwner || permissions?.canManageStaff;
  const canManageRoster = permissions?.canManageRoster;

  const statsData = useMemo(() => [
    {
      title: "Win Rate",
      value: `${stats?.winRate || 0}%`,
      icon: Trophy,
      color: "emerald",
    },
    {
      title: "Total Matches",
      value: stats?.totalMatches || 0,
      icon: Target,
      color: "blue",
    },
    {
      title: "Tournament Wins",
      value: stats?.tournamentWins || 0,
      icon: Crown,
      color: "amber",
    },
    {
      title: "Total Prize Won",
      value: `$${(stats?.totalPrizeWon || 0).toLocaleString()}`,
      icon: Users,
      color: "purple",
    },
  ], [stats]);

  if (isLoading && !currentTeam) {
    return <TeamLoading />;
  }

  if (isError && !currentTeam) {
    return (
      <TeamError
        title="Failed to Load Dashboard"
        message={error?.message || "There was an error loading your team dashboard."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!currentTeam) {
    return (
      <TeamError
        title="No Team Found"
        message="You are not currently a member of a team. Join or create one to access the dashboard."
        onRetry={() => navigate("/teams/discovery")}
      />
    );
  }


  return (
    <div className="h-full flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto w-full px-4 md:px-6 py-4 md:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 pb-12"
        >
          {/* Team Header */}
          <motion.div variants={itemVariants}>
            {currentTeam && <TeamHeader team={currentTeam} isDashboard={true} />}
          </motion.div>

          {/* Stats Section - Moved to top for immediate impact */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Performance Overview</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat, index) => (
                <TeamStatCard key={index} {...stat} />
              ))}
            </div>
          </motion.div>

          {/* Quick Actions - Enhanced Visuals */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(TEAM_ROUTES.MEMBERS)}
                className="h-auto p-4 flex flex-col items-start gap-4 border border-white/10 hover:border-purple-500/50 bg-[#0F111A]/40 hover:bg-[#121421]/60 rounded-2xl transition-all duration-500 group backdrop-blur-md"
              >
                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left space-y-1">
                  <span className="text-sm font-bold text-white block">View Roster</span>
                  <span className="text-xs text-gray-400">Manage team lineup</span>
                </div>
              </Button>

              {canManageRoster && (
                <Button
                  variant="ghost"
                  onClick={() => navigate(TEAM_ROUTES.MEMBERS)}
                  className="h-auto p-4 flex flex-col items-start gap-4 border border-white/10 hover:border-emerald-500/50 bg-[#0F111A]/40 hover:bg-[#121421]/60 rounded-2xl transition-all duration-500 group backdrop-blur-md"
                >
                  <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                    <UserPlus className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-sm font-bold text-white block">Invite Players</span>
                    <span className="text-xs text-gray-400">Expand your squad</span>
                  </div>
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => navigate(TEAM_ROUTES.TOURNAMENTS)}
                className="h-auto p-4 flex flex-col items-start gap-4 border border-white/10 hover:border-amber-500/50 bg-[#0F111A]/40 hover:bg-[#121421]/60 rounded-2xl transition-all duration-500 group backdrop-blur-md"
              >
                <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-left space-y-1">
                  <span className="text-sm font-bold text-white block">Find Tournaments</span>
                  <span className="text-xs text-gray-400">Join competitive events</span>
                </div>
              </Button>

              {canManageSettings && (
                <Button
                  variant="ghost"
                  onClick={() => navigate(TEAM_ROUTES.SETTINGS)}
                  className="h-auto p-4 flex flex-col items-start gap-4 border border-white/10 hover:border-rose-500/50 bg-[#0F111A]/40 hover:bg-[#121421]/60 rounded-2xl transition-all duration-500 group backdrop-blur-md"
                >
                  <div className="p-3 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                    <Settings className="w-6 h-6 text-rose-400" />
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-sm font-bold text-white block">Team Settings</span>
                    <span className="text-xs text-gray-400">Configure team profile</span>
                  </div>
                </Button>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Matches */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Recent Matches
                </h2>
                <Button
                  variant="link"
                  onClick={() => navigate(TEAM_ROUTES.PERFORMANCE)}
                  className="text-purple-400 text-sm font-medium hover:text-purple-300 p-0 flex items-center gap-1 group"
                >
                  View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {currentTeam.matches && currentTeam.matches.length > 0 ? (
                  currentTeam.matches.slice(0, 3).map((match, idx) => (
                    <TeamRecentMatch
                      key={idx}
                      opponent={match.opponent}
                      result={match.result}
                      score={match.score}
                      date={match.date}
                      map={match.map}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-white/10 rounded-2xl bg-[#0F111A]/40 backdrop-blur-xl">
                    <p className="text-gray-500 text-sm italic">No recent match history found.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tournaments */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Active Tournaments
                </h2>
                <Button
                  variant="link"
                  onClick={() => navigate(TEAM_ROUTES.TOURNAMENTS)}
                  className="text-purple-400 text-sm font-medium hover:text-purple-300 p-0 flex items-center gap-1 group"
                >
                  Manage <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {currentTeam.playedTournaments && currentTeam.playedTournaments.length > 0 ? (
                  currentTeam.playedTournaments.slice(0, 3).map((t, idx) => (
                    <TournamentItem
                      key={idx}
                      id={t.event}
                      name={t.tournamentName || t.title || `Tournament #${idx + 1}`}
                      date={t.playedAt ? new Date(t.playedAt).toLocaleDateString() : 'TBD'}
                      prize={t.prizeWon}
                      status={t.status}
                      placement={t.placement}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-white/10 rounded-2xl bg-[#0F111A]/40 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Trophy className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Active Tournaments</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-[200px]">Ready to compete? Find your next challenge now.</p>
                    <Button
                      onClick={() => navigate(TEAM_ROUTES.TOURNAMENTS)}
                      className="bg-purple-600/90 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20"
                    >
                      Find Tournaments
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TeamDashboardPage;
