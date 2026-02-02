import React from "react";
import { Gamepad2, Trophy, Clock, Target, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { User } from "@/features/auth/lib/types";

interface PlayerStatsProps {
  player: User;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  const gameStats = player.playerStats?.gameSpecificStats || [];

  if (gameStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#0d091a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl text-center">
        <div className="p-6 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
          <Gamepad2 className="w-12 h-12 text-blue-400 opacity-50" />
        </div>
        <h3 className="text-2xl font-black tracking-tighter text-white mb-2">No Battle Data</h3>
        <p className="text-sm text-white/40 max-w-sm">No game-specific tactical data has been recorded for this operative yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {gameStats.map((stats, index) => (
        <GameStatCard key={index} stats={stats} index={index} />
      ))}
    </div>
  );
};

const GameStatCard: React.FC<{ stats: any, index: number }> = ({ stats, index }) => {
  const tierColors: any = {
    bronze: "from-amber-700 to-amber-900 border-amber-500/30 text-amber-500",
    silver: "from-slate-400 to-slate-600 border-slate-400/30 text-slate-300",
    gold: "from-yellow-400 to-yellow-600 border-yellow-500/30 text-yellow-500",
    platinum: "from-cyan-400 to-cyan-600 border-cyan-500/30 text-cyan-400",
    diamond: "from-blue-400 to-blue-600 border-blue-500/30 text-blue-400",
    master: "from-violet-400 to-violet-600 border-violet-500/30 text-violet-400",
    grandmaster: "from-rose-500 to-rose-700 border-rose-500/30 text-rose-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-[#0d091a]/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-violet-500/20 transition-all duration-500 shadow-2xl">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-violet-500/10 transition-colors text-violet-400">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">{stats.game}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-[0.2em]">
                  <Clock className="w-3 h-3" />
                  <span>{stats.hoursPlayed.toLocaleString()} Combat Hours</span>
                </div>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${tierColors[stats.tier || "bronze"]} border shadow-lg text-[9px] font-black tracking-widest px-3 py-1`}>
              {stats.tier || "RANK"}
            </Badge>
          </div>

          {/* Core Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-1">
              <p className="text-[9px] font-black text-white/20 tracking-[0.2em]">Combat Rating</p>
              <p className="text-2xl font-black text-white tracking-tighter">{stats.rating}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-1">
              <p className="text-[9px] font-black text-white/20 tracking-[0.2em]">Success Rate</p>
              <p className="text-2xl font-black text-emerald-400 tracking-tighter">{stats.winRate}%</p>
            </div>
          </div>

          {/* Rank Section */}
          <div className="relative pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-white/20 tracking-[0.3em]">Current Deployment Rank</span>
              <Trophy className="w-4 h-4 text-violet-500/50" />
            </div>
            <p className="text-2xl font-black text-white transition-all group-hover:text-violet-400">
              {stats.rank}
            </p>
          </div>

          {/* Secondary Stats */}
          <div className="flex items-center justify-between pt-4 text-[10px] font-black tracking-[0.2em] text-white/40">
            <div className="flex items-center gap-2">
              <Swords className="w-3.5 h-3.5" />
              <span>{stats.matches} Engagements</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              <span>KDA: {stats.kda}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
