import React from 'react';
import { Trophy, Medal, Sparkles, Award } from 'lucide-react';
import { GlassCard } from "./ThemedComponents";
import { formatCurrency } from "@/lib/utils";

interface PrizeItem {
    rank: number;
    amount: number;
    label?: string;
}

interface PrizeDistributionProps {
    prizes: PrizeItem[];
    title?: string;
}

export const PrizeDistribution: React.FC<PrizeDistributionProps> = ({ prizes, title = "Prize Distribution" }) => {
    if (!prizes || prizes.length === 0) return null;

    // Helper to get rank-specific styles
    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1:
                return {
                    icon: <Trophy size={24} className="text-yellow-400" />,
                    bg: "from-yellow-500/10 to-transparent",
                    border: "border-yellow-500/20",
                    glow: "shadow-[0_0_20px_rgba(234,179,8,0.1)]",
                    labelColor: "text-yellow-400"
                };
            case 2:
                return {
                    icon: <Medal size={24} className="text-slate-300" />,
                    bg: "from-slate-400/10 to-transparent",
                    border: "border-slate-400/20",
                    glow: "shadow-[0_0_20px_rgba(148,163,184,0.1)]",
                    labelColor: "text-slate-300"
                };
            case 3:
                return {
                    icon: <Medal size={24} className="text-amber-600" />,
                    bg: "from-amber-700/10 to-transparent",
                    border: "border-amber-700/20",
                    glow: "shadow-[0_0_20px_rgba(180,83,9,0.1)]",
                    labelColor: "text-amber-600"
                };
            default:
                return {
                    icon: <Award size={20} className="text-purple-400/50" />,
                    bg: "from-white/5 to-transparent",
                    border: "border-white/10",
                    glow: "",
                    labelColor: "text-gray-400"
                };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center">
                    <Sparkles size={16} className="text-amber-400" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {prizes.map((prize, idx) => {
                    const styles = getRankStyles(prize.rank);
                    return (
                        <GlassCard 
                            key={idx} 
                            className={`p-5 relative group border ${styles.border} ${styles.bg} ${styles.glow} hover:border-white/20 transition-all duration-500`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-0 group-hover:scale-110 transition-transform duration-500`}>
                                    {styles.icon}
                                </div>
                                <div className="text-right">
                                    <p className={`text-[10px] font-black uppercase tracking-tighter ${styles.labelColor}`}>
                                        {String(prize.rank) === "1" ? "Champion" :
                                         String(prize.rank) === "2" ? "Runner Up" :
                                         String(prize.rank) === "3" ? "2nd Runner Up" :
                                         (prize.label || `Rank ${prize.rank}`)}
                                    </p>
                                    <p className="text-xs font-bold text-gray-500">Position {prize.rank}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-2xl font-black text-white tracking-tighter leading-none">
                                    ₹{formatCurrency(prize.amount)}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Awaiting Claim
                                </p>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
};
