import React from "react";
import { Gamepad2, Trophy, Clock, Target, Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type GameStats = {
  game: string;
  rank: string;
  rating: number;
  hoursPlayed: number;
  winRate: number;
  matches: number;
  kda: number;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master" | "grandmaster";
};

export const PlayerStats: React.FC = () => {
  const gameStats: GameStats[] = [
    {
      game: "Valorant",
      rank: "Diamond 1",
      rating: 2450,
      hoursPlayed: 1200,
      winRate: 67,
      matches: 800,
      kda: 2.3,
      color: "#6366f1",
      tier: "diamond",
    },
    {
      game: "League of Legends",
      rank: "Platinum 3",
      rating: 2100,
      hoursPlayed: 900,
      winRate: 59,
      matches: 600,
      kda: 2.0,
      color: "#06b6d4",
      tier: "platinum",
    },
    {
      game: "CS:GO",
      rank: "Master Guardian",
      rating: 1800,
      hoursPlayed: 600,
      winRate: 54,
      matches: 400,
      kda: 1.8,
      color: "#f59e42",
      tier: "gold",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {gameStats.map((stats, index) => (
        <GameStatCard key={stats.game} stats={stats} index={index} />
      ))}
    </div>
  );
};

const GameStatCard: React.FC<{ stats: GameStats, index: number }> = ({ stats, index }) => {
  const tierColors = {
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
              <div
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-violet-500/10 transition-colors"
                style={{ color: stats.color }}
              >
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-tight">{stats.game}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <Clock className="w-3 h-3" />
                  <span>{stats.hoursPlayed.toLocaleString()} Combat Hours</span>
                </div>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${tierColors[stats.tier]} border shadow-lg uppercase text-[9px] font-black tracking-widest px-3 py-1`}>
              {stats.tier}
            </Badge>
          </div>

          {/* Core Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-1">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Combat Rating</p>
              <p className="text-2xl font-black text-white italic tracking-tighter">{stats.rating}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-1">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Success Rate</p>
              <p className="text-2xl font-black text-emerald-400 italic tracking-tighter">{stats.winRate}%</p>
            </div>
          </div>

          {/* Rank Section */}
          <div className="relative pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Current Deployment Rank</span>
              <Trophy className="w-4 h-4 text-violet-500/50" />
            </div>
            <p className="text-2xl font-black text-white italic transition-all group-hover:text-violet-400">
              {stats.rank}
            </p>
          </div>

          {/* Secondary Stats */}
          <div className="flex items-center justify-between pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
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
