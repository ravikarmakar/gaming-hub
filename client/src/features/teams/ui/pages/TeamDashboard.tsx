import { useEffect } from "react";
import { Users, Trophy, Crown, Target, UserPlus, Settings, ArrowRight, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { TeamHeader } from "../components/TeamHeader";
import { TeamStatCard } from "../components/TeamStatCard";
import { TeamRecentMatch } from "../components/TeamRecentMatch";
import { TournamentItem } from "../components/TournamentItem";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACCESS, TEAM_ACTIONS, TEAM_ACTIONS_ACCESS } from "../../lib/access";
import { TEAM_ROUTES } from "../../lib/routes";

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { can } = useAccess();
  const { currentTeam, clearError } = useTeamStore();

  const canManageSettings = can(TEAM_ACCESS.settings);
  const canManageRoster = can(TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.manageRoster]);

  useEffect(() => {
    // Clear any previous errors (e.g., from failed member adding) when visiting dashboard
    clearError();
    // Layout handles fetching now
  }, [clearError]);

  if (!currentTeam) return null;

  const statsData = [
    {
      title: "Win Rate",
      value: `${currentTeam.stats?.winRate || 0}%`,
      icon: Trophy,
      color: "emerald",
    },
    {
      title: "Total Matches",
      value: currentTeam.stats?.totalMatches || 0,
      icon: Target,
      color: "blue",
    },
    {
      title: "Tournament Wins",
      value: currentTeam.stats?.tournamentWins || 0,
      icon: Crown,
      color: "amber",
    },
    {
      title: "Total Prize Won",
      value: `$${(currentTeam.stats?.totalPrizeWon || 0).toLocaleString()}`,
      icon: Users,
      color: "purple",
    },
  ];

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-12 space-y-8"
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
            <TeamRecentMatch
              opponent="Nexus Gaming"
              result="win"
              score="16 - 12"
              date="2 hours ago"
              map="Dust II"
            />
            <TeamRecentMatch
              opponent="Cyber Wolves"
              result="win"
              score="16 - 8"
              date="1 day ago"
              map="Mirage"
            />
            <TeamRecentMatch
              opponent="Dark Phoenix"
              result="loss"
              score="14 - 16"
              date="2 days ago"
              map="Inferno"
            />
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
            {currentTeam.playedTournaments?.length > 0 ? (
              currentTeam.playedTournaments.slice(0, 3).map((t, idx) => (
                <TournamentItem
                  key={idx}
                  id={t.event}
                  name={`Tournament ${idx + 1}`}
                  date={new Date(t.playedAt).toLocaleDateString()}
                  prize={t.prizeWon}
                  status={t.status}
                  placement={t.placement}
                />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-white/10 rounded-2xl bg-[#0F111A]/40 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-gray-600" />
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
  );
};

export default TeamDashboard;
