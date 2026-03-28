import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, ShieldCheck, Users, ChevronRight } from "lucide-react";
import { User as UserType } from "@/features/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";

interface PlayerCardProps {
    player: UserType;
    index: number;
}

const PlayerCard = React.forwardRef<HTMLDivElement, PlayerCardProps>(({ player }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const avatarUrl = player.avatar?.includes("default-avatar-url.com")
        ? `https://ui-avatars.com/api/?name=${player.username}&background=random`
        : (player.avatar || `https://ui-avatars.com/api/?name=${player.username}&background=random`);

    return (
        <div ref={ref} className="group relative h-full">
            <Link
                to={player._id ? `/players/${player._id}` : "#"}
                aria-disabled={!player._id}
                tabIndex={!player._id ? -1 : undefined}
                className={cn(
                    "block h-full transition-all duration-500",
                    !player._id && "pointer-events-none opacity-60"
                )}
            >
                <GlassCard className="h-full flex flex-row sm:flex-col p-0 overflow-hidden hover:border-purple-500/30 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]">
                    {/* Subtle Top Shine */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    {/* Card Content Area */}
                    <div className="relative flex flex-row sm:flex-col h-full w-full p-2 sm:p-6 gap-2 sm:gap-0">
                        {/* Left: Avatar for mobile, Header for desktop */}
                        <div className="flex sm:flex-row items-center sm:items-start justify-center sm:justify-between sm:mb-6 shrink-0">
                            <div className="relative group/avatar">
                                {/* Avatar Container */}
                                <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-lg sm:rounded-2xl p-[1px] bg-gradient-to-br from-white/20 to-transparent overflow-hidden z-10">
                                    <div className="w-full h-full rounded-[7px] sm:rounded-[15px] bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                                        {!isLoaded && <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-lg sm:rounded-2xl bg-white/5 animate-pulse" />}
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={player.username}
                                                onLoad={() => setIsLoaded(true)}
                                                onError={() => setIsLoaded(true)}
                                                loading="lazy"
                                                className={cn(
                                                    "w-full h-full object-cover transition-all duration-700 grayscale-[0.2] group-hover:grayscale-0",
                                                    isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                                                )}
                                            />
                                        ) : (
                                            <User className="w-7 h-7 sm:w-10 sm:h-10 text-white/20" />
                                        )}
                                    </div>
                                </div>

                                {/* Verification Badges */}
                                <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 z-20 flex flex-col gap-0.5 sm:gap-1">
                                    {player.isPlayerVerified && (
                                        <div className="p-0.5 px-1 sm:p-1 sm:px-2 rounded bg-purple-600 text-white text-[6px] sm:text-[8px] font-black uppercase tracking-tighter" title="Elite Warrior">
                                            PRO
                                        </div>
                                    )}
                                    {player.isAccountVerified && (
                                        <div className="p-0.5 sm:p-1 rounded-full bg-blue-600 text-white shadow-lg" title="Verified Account">
                                            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Esports Role Pin (Desktop only or very small) */}
                            <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-white/60 tracking-wider font-mono">
                                    {player.esportsRole?.toUpperCase() || "WARRIOR"}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0 justify-center sm:justify-start">
                            {/* Identity & Team Section */}
                            <div className="mb-1 sm:mb-6">
                                <div className="flex items-center gap-2 mb-0.5 sm:mb-2">
                                    <h3 className="text-base sm:text-2xl font-black text-white tracking-tight leading-none group-hover:text-purple-400 transition-colors truncate">
                                        {player.username}
                                    </h3>
                                    {/* Mobile Role Badge */}
                                    <span className="sm:hidden px-1.5 py-0.5 rounded bg-white/5 text-[7px] font-bold text-white/40 uppercase tracking-tighter border border-white/5">
                                        {player.esportsRole || "WARRIOR"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/60 transition-colors">
                                    <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
                                    <span className="text-xs sm:text-sm font-medium truncate">
                                        {typeof player.teamId !== "string" && player.teamId ? (
                                            <span className="flex items-center gap-1.5">
                                                {player.teamId.teamName}
                                                <span className="text-white/20 hidden sm:inline">#{player.teamId.tag}</span>
                                            </span>
                                        ) : "Free Agent"}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Section: Clean Grid (Desktop only or highly condensed) */}
                            {player.playerStats && (
                                <div className="hidden sm:grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 mb-6 mt-auto">
                                    <div className="p-4 bg-[#080808] group/stat hover:bg-[#0c0c0c] transition-colors">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Win Rate</p>
                                        <p className="text-xl font-black text-white">{player.playerStats.winRate != null ? `${player.playerStats.winRate}%` : '—'}</p>
                                    </div>
                                    <div className="p-4 bg-[#080808] group/stat hover:bg-[#0c0c0c] transition-colors">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">K/D Ratio</p>
                                        <p className="text-xl font-black text-white">{player.playerStats.kdRatio ?? '—'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Integrated CTA Footer (Desktop only) */}
                            <div className="hidden sm:flex items-center justify-between pt-4 border-t border-white/[0.05]">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">
                                    Analyze Performance
                                </span>
                                <ChevronRight size={16} className="text-white/20 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </Link>
        </div>
    );
});

export default PlayerCard;
