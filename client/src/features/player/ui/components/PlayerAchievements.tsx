import React from "react";
import { Award, Zap, Flame, Crown, CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export const PlayerAchievements: React.FC = () => {
  const achievements: Achievement[] = [
    {
      id: "ach1",
      title: "Tactical Executioner",
      description: "Achieve the first kill in 50 matches.",
      icon: <Zap className="w-5 h-5" />,
      rarity: "common",
      unlockedAt: "2023-01-10T12:00:00.000Z",
      progress: 50,
      maxProgress: 50,
    },
    {
      id: "ach2",
      title: "Indomitable Force",
      description: "Win 10 professional level matches in a row.",
      icon: <Flame className="w-5 h-5" />,
      rarity: "rare",
      unlockedAt: "2023-02-15T12:00:00.000Z",
      progress: 10,
      maxProgress: 10,
    },
    {
      id: "ach3",
      title: "Absolute Zenith",
      description: "Reach the grandmaster rank in three different seasonal cycles.",
      icon: <Crown className="w-5 h-5" />,
      rarity: "legendary",
      unlockedAt: "2024-01-01T12:00:00.000Z",
    },
    {
      id: "ach4",
      title: "Squad Carrier",
      description: "Average over 1.5 KDA in 100 competitive matches.",
      icon: <Award className="w-5 h-5" />,
      rarity: "epic",
      progress: 65,
      maxProgress: 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {achievements.map((ach, index) => (
        <AchievementCard key={ach.id} achievement={ach} index={index} />
      ))}
    </div>
  );
};

const AchievementCard: React.FC<{ achievement: Achievement, index: number }> = ({ achievement, index }) => {
  const rarityConfig = {
    common: { bg: "from-slate-500/10 to-transparent", text: "text-slate-400", border: "border-slate-500/20", glow: "shadow-slate-500/5" },
    rare: { bg: "from-blue-500/10 to-transparent", text: "text-blue-400", border: "border-blue-500/20", glow: "shadow-blue-500/5" },
    epic: { bg: "from-violet-500/10 to-transparent", text: "text-violet-400", border: "border-violet-500/20", glow: "shadow-violet-500/5" },
    legendary: { bg: "from-amber-500/10 to-transparent", text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-amber-500/5" },
  };

  const config = rarityConfig[achievement.rarity];
  const isUnlocked = !!achievement.unlockedAt;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`relative overflow-hidden bg-white/[0.02] backdrop-blur-3xl border ${config.border} rounded-3xl p-6 transition-all duration-500 group hover:bg-white/[0.04] shadow-2xl`}>
        {/* Rarity Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-20`} />

        <div className="relative z-10 flex gap-6">
          {/* Icon Container */}
          <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-[#050505] border border-white/5 shadow-inner transition-transform group-hover:scale-110 duration-500 ${config.text}`}>
            {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 opacity-20" />}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`text-lg font-black italic uppercase tracking-tighter ${isUnlocked ? 'text-white' : 'text-white/30'}`}>
                  {achievement.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${config.text}`}>{achievement.rarity} Commendation</span>
                  {isUnlocked && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
              {isUnlocked && (
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                  {new Date(achievement.unlockedAt!).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            <p className="text-xs text-white/40 font-medium leading-relaxed">
              {achievement.description}
            </p>

            {achievement.maxProgress && (
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
                  <span>Progression</span>
                  <span className={isUnlocked ? 'text-emerald-400' : ''}>{achievement.progress} / {achievement.maxProgress}</span>
                </div>
                <Progress
                  value={(achievement.progress || 0) / achievement.maxProgress * 100}
                  className={`h-1.5 bg-white/5 ${isUnlocked ? '[&>div]:bg-emerald-500' : ''}`}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
