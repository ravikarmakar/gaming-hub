import { Trophy, Medal, Sparkles, Award } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from '../shared/ThemedComponents';

interface PrizeItem {
    rank: number;
    amount: number;
    label?: string;
}

interface PrizeDistributionProps {
    prizes: PrizeItem[];
    title?: string;
    height?: string | number;
    width?: string | number;
    className?: string;
    itemClassName?: string;
}

export const PrizeDistribution: React.FC<PrizeDistributionProps> = ({ 
    prizes, 
    title, 
    height, 
    width,
    className = "",
    itemClassName = ""
}) => {
    if (!prizes || prizes.length === 0) return null;

    // Helper to get rank-specific styles
    const getRankStyles = (rank: number) => {
        const nRank = Number(rank);
        switch (nRank) {
            case 1:
                return {
                    icon: <Trophy size={height ? 20 : 32} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />,
                    bg: "bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent",
                    border: "border-yellow-500/30",
                    glow: "shadow-[0_0_30px_rgba(234,179,8,0.15)]",
                    label: "Champion",
                    color: "text-yellow-400"
                };
            case 2:
                return {
                    icon: <Medal size={height ? 18 : 28} className="text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]" />,
                    bg: "bg-gradient-to-br from-slate-400/20 via-slate-400/5 to-transparent",
                    border: "border-slate-400/30",
                    glow: "shadow-[0_0_30px_rgba(148,163,184,0.15)]",
                    label: "Runner Up",
                    color: "text-slate-300"
                };
            case 3:
                return {
                    icon: <Medal size={height ? 18 : 28} className="text-amber-600 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />,
                    bg: "bg-gradient-to-br from-amber-700/20 via-amber-700/5 to-transparent",
                    border: "border-amber-700/30",
                    glow: "shadow-[0_0_30px_rgba(180,83,9,0.15)]",
                    label: "2nd Runner Up",
                    color: "text-amber-600"
                };
            default:
                return {
                    icon: <Award size={18} className="text-purple-400/50" />,
                    bg: "bg-white/5",
                    border: "border-white/5",
                    glow: "",
                    label: `Rank ${rank}`,
                    color: "text-gray-400"
                };
        }
    };

    const sortedPrizes = [...prizes].sort((a, b) => a.rank - b.rank);
    const podiumPrizes = sortedPrizes.filter(p => p.rank <= 3);
    const otherPrizes = sortedPrizes.filter(p => p.rank > 3);

    // If height/width are passed, we use a simpler list-like layout that fits those dimensions
    const isControlled = !!(height || width);

    return (
        <div className={`space-y-6 ${className}`}>
            {title && (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center">
                        <Sparkles size={16} className="text-amber-400" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                        {title}
                    </h3>
                </div>
            )}

            {!isControlled ? (
                <>
                    {/* Default Premium Podium Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {podiumPrizes.map((prize, idx) => {
                            const styles = getRankStyles(prize.rank);
                            return (
                                <GlassCard
                                    key={idx}
                                    className={`p-8 relative group border-2 ${styles.border} ${styles.bg} ${styles.glow} hover:scale-[1.02] transition-all duration-500 overflow-hidden ${itemClassName}`}
                                >
                                    <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                        <Trophy size={120} />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                                            {styles.icon}
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className={`text-xs font-black uppercase tracking-[0.3em] ${styles.color}`}>
                                                {styles.label}
                                            </p>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">RANK {prize.rank < 10 ? `0${prize.rank}` : prize.rank}</p>
                                        </div>

                                        <div className="pt-2">
                                            <p className="text-4xl font-black text-white tracking-tightest">
                                                ₹{formatCurrency(prize.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>

                    {otherPrizes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {otherPrizes.map((prize, idx) => (
                                <GlassCard
                                    key={idx}
                                    className="px-6 py-4 flex items-center justify-between border-white/5 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-[10px] font-black text-white/30 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all">
                                            #{prize.rank}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Position</p>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{prize.label || `Rank ${prize.rank}`}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white tracking-tight">₹{formatCurrency(prize.amount)}</p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* Size-Controlled Layout (for Dashboard) */
                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    style={{ 
                        width: typeof width === 'number' ? `${width}px` : width,
                        maxHeight: typeof height === 'number' ? `${height}px` : height,
                        overflowY: height ? 'auto' : 'visible'
                    }}
                >
                    {sortedPrizes.map((prize, idx) => {
                        const styles = getRankStyles(prize.rank);
                        return (
                            <GlassCard
                                key={idx}
                                className={`px-4 py-3 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative ${itemClassName}`}
                            >
                                {prize.rank <= 3 && (
                                    <div className={`absolute inset-y-0 left-0 w-1 ${styles.color.replace('text-', 'bg-')}/30`} />
                                )}
                                
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-all`}>
                                        {styles.icon}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-0.5">Rank {prize.rank}</p>
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[100px]">
                                            {prize.label || styles.label}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white tracking-tight">₹{formatCurrency(prize.amount)}</p>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
