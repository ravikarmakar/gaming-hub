
import { Trophy, Medal, Star, Target } from "lucide-react";
import { GlassCard } from "./ThemedComponents";
import { Leaderboard } from "@/features/organizer/store/useTournamentStore";

interface FinalLeaderboardProps {
    leaderboard: Leaderboard;
    title?: string;
}

const FinalLeaderboard = ({ leaderboard, title = "Final Standings" }: FinalLeaderboardProps) => {
    // Sort logic: Qualified first, then Points (Descending)
    const sortedTeamScores = [...leaderboard.teamScore].sort((a, b) => {
        if (a.isQualified !== b.isQualified) {
            return a.isQualified ? -1 : 1;
        }
        return b.totalPoints - a.totalPoints;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <Trophy size={20} className="sm:hidden" />
                    <Trophy size={24} className="hidden sm:block" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-[0.1em] sm:tracking-widest uppercase">{title}</h2>
                    <p className="text-gray-500 text-[8px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-0.5">Tournament Legends Protocol</p>
                </div>
            </div>

            <div className="grid gap-4">
                {sortedTeamScores.map((entry, index) => {
                    const isTop3 = index < 3;
                    const isQualified = entry.isQualified;

                    // Rank Styling
                    let rankIcon = null;
                    let rankColor = "text-gray-400";
                    let ringColor = "border-white/5";
                    let glowColor = "";

                    if (index === 0) {
                        rankIcon = <Trophy className="text-amber-400 w-5 h-5" />;
                        rankColor = "text-amber-400";
                        ringColor = "border-amber-400/30";
                        glowColor = "shadow-[0_0_30px_rgba(251,191,36,0.1)]";
                    } else if (index === 1) {
                        rankIcon = <Medal className="text-gray-300 w-5 h-5" />;
                        rankColor = "text-gray-200";
                        ringColor = "border-gray-300/30";
                        glowColor = "shadow-[0_0_30px_rgba(209,213,219,0.1)]";
                    } else if (index === 2) {
                        rankIcon = <Medal className="text-amber-700 w-5 h-5" />;
                        rankColor = "text-orange-400";
                        ringColor = "border-orange-700/30";
                        glowColor = "shadow-[0_0_30px_rgba(194,65,12,0.1)]";
                    }

                    return (
                        <GlassCard
                            key={entry.teamId._id}
                            className={`p-1 overflow-hidden transition-all duration-500 hover:translate-x-1 ${ringColor} ${glowColor} ${isQualified ? 'bg-white/[0.03]' : 'opacity-60'}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
                                <div className="flex items-center gap-4 sm:gap-6">
                                    {/* Rank Indicator */}
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center font-black text-base sm:text-xl border border-white/5 bg-black/40 ${rankColor}`}>
                                        {rankIcon ? rankIcon : `#${index + 1}`}
                                    </div>

                                    {/* Team Intel */}
                                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-offset-2 sm:ring-offset-4 ring-offset-[#0B0C1A] overflow-hidden flex-shrink-0 ${isTop3 ? ringColor : 'ring-white/5'}`}>
                                            {entry.teamId.teamLogo ? (
                                                <img src={entry.teamId.teamLogo} alt={entry.teamId.teamName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 font-bold uppercase text-[10px] sm:text-xs">
                                                    {entry.teamId.teamName.slice(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className={`text-sm sm:text-lg font-black tracking-tight truncate ${isTop3 ? 'text-white' : 'text-gray-300'}`}>
                                                {entry.teamId.teamName}
                                            </h4>
                                            <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                                                <span className="flex items-center gap-1 text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.1em] sm:tracking-widest">
                                                    <Target size={10} className="text-red-500/50" /> {entry.kills} K
                                                </span>
                                                <span className="flex items-center gap-1 text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.1em] sm:tracking-widest">
                                                    <Star size={10} className="text-yellow-500/50" /> {entry.matchesPlayed} M
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Points Display */}
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1.5 text-right">Combat Efficiency</p>
                                        <div className="flex items-center gap-1 justify-end">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 w-4 rounded-full ${i < (entry.totalPoints / 20) ? (isTop3 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-blue-500') : 'bg-white/5'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="sm:bg-white/5 sm:border sm:border-white/5 sm:px-5 sm:py-2.5 sm:rounded-xl flex flex-col sm:items-end">
                                        <p className="text-[8px] sm:text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5">Arena Score</p>
                                        <p className={`text-xl sm:text-2xl font-black ${isTop3 ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-400'}`}>
                                            {entry.totalPoints.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            {/* Platform Seal */}
            <div className="flex items-center justify-center pt-4 opacity-20 hover:opacity-100 transition-opacity">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                <span className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Official Arena Verified Results</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
            </div>
        </div>
    );
};

export default FinalLeaderboard;
