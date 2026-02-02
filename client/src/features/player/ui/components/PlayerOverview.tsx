import React from "react";
import { Crown, Gamepad2, Star, Zap, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { User } from "@/features/auth/lib/types";

interface PlayerOverviewProps {
  player: User;
}

export const PlayerOverview: React.FC<PlayerOverviewProps> = ({ player }) => {
  const stats = player.playerStats || {
    level: 1,
    xp: 0,
    xpToNext: 1000,
    favoriteGame: "N/A",
    highestRank: "UNRANKED",
    winRate: 0,
    kdRatio: 0,
    matchesPlayed: 0
  };

  const percentage = Math.min((stats.xp / stats.xpToNext) * 100, 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Level Card */}
        <motion.div whileHover={{ y: -5 }} className="h-full">
          <Card className="h-full bg-[#0d091a]/40 backdrop-blur-3xl border-white/5 rounded-[2rem] overflow-hidden group shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] text-white/30">Operative Level</CardTitle>
                <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-white">LV.{stats.level}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black tracking-[0.2em] text-white/40">
                  <span>Experience Progression</span>
                  <span>{percentage.toFixed(0)}%</span>
                </div>
                <Progress value={percentage} className="h-2 bg-white/5 overflow-hidden rounded-full" />
                <div className="flex justify-between text-[9px] font-bold text-white/20 tracking-[0.1em]">
                  <span>{stats.xp.toLocaleString()} XP</span>
                  <span>{stats.xpToNext.toLocaleString()} XP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Favorite Spec Card */}
        <motion.div whileHover={{ y: -5 }} className="h-full">
          <Card className="h-full bg-[#0d091a]/40 backdrop-blur-3xl border-white/5 rounded-[2rem] overflow-hidden group shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] text-white/30">Preferred Specialization</CardTitle>
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Gamepad2 className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-[120px]">
              <div>
                <p className="text-4xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors">{stats.favoriteGame || "N/A"}</p>
                <p className="text-[10px] font-black text-white/20 tracking-[0.2em] mt-2">FAVORITE COMBAT SECTOR</p>
              </div>
              <div className="flex items-center gap-2 pt-4 opacity-40">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-black tracking-widest">Active Engagement</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tactical Achievement Card */}
        <motion.div whileHover={{ y: -5 }} className="h-full">
          <Card className="h-full bg-[#0d091a]/40 backdrop-blur-3xl border-white/5 rounded-[2rem] overflow-hidden group shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] text-white/30">Combat Status</CardTitle>
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Crown className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-[120px]">
              <div>
                <p className="text-4xl font-black tracking-tighter text-white group-hover:text-purple-400 transition-colors">{stats.highestRank || "UNRANKED"}</p>
                <p className="text-[10px] font-black text-white/20 tracking-[0.2em] mt-2">ALL-TIME ZENITH RANK</p>
              </div>
              <div className="flex items-center gap-2 pt-4 opacity-40">
                <Zap className="w-3 h-3 text-violet-400" />
                <span className="text-[9px] font-black tracking-widest">Elite Operative</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Execution Precision (Win Rate)", value: `${stats.winRate}%`, icon: Target, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Neutralization Efficiency (K/D)", value: stats.kdRatio, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Mission Completion", value: stats.matchesPlayed.toLocaleString(), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Universal Game UID", value: player.gameUid || "UNREGISTERED", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" }
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }}>
            <Card className="bg-white/[0.02] border-white/5 rounded-2xl p-6 transition-all border-white/5 hover:border-white/10 shadow-lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 tracking-[0.2em] mb-1">{item.label}</p>
                  <p className="text-xl font-black text-white tracking-tight">{item.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
