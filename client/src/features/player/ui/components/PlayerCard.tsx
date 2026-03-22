import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, ShieldCheck, Users, ChevronRight } from "lucide-react";
import { User as UserType } from "@/features/auth/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
                onClick={!player._id ? (e) => e.preventDefault() : undefined}
                className={cn(
                    "relative flex flex-col h-full overflow-hidden rounded-3xl bg-[#030303] border border-white/[0.08] transition-all duration-500 hover:border-white/20 hover:bg-[#0a0a0a] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]",
                    !player._id && "pointer-events-none opacity-60"
                )}
            >
                {/* Subtle Top Shine */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                {/* Card Content Area */}
                <div className="relative flex flex-col h-full p-6">
                    {/* Header: Medium Avatar + Identity */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="relative group/avatar">
                            {/* Avatar Container */}
                            <div className="relative w-20 h-20 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 to-transparent overflow-hidden z-10">
                                <div className="w-full h-full rounded-[15px] bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                                    {!isLoaded && <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-2xl bg-white/5 animate-pulse" />}
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
                                        <User className="w-10 h-10 text-white/20" />
                                    )}
                                </div>
                            </div>

                            {/* Verification Badges Integrated */}
                            <div className="absolute -top-2 -left-2 z-20 flex flex-col gap-1">
                                {player.isPlayerVerified && (
                                    <div className="p-1 px-2 rounded-md bg-purple-600 text-white text-[8px] font-black uppercase tracking-tighter shadow-lg" title="Elite Warrior">
                                        PRO
                                    </div>
                                )}
                                {player.isAccountVerified && (
                                    <div className="p-1 rounded-full bg-blue-600 text-white shadow-lg" title="Verified Account">
                                        <ShieldCheck className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Esports Role Pin */}
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/60 tracking-wider font-mono">
                                {player.esportsRole?.toUpperCase() || "WARRIOR"}
                            </span>
                        </div>
                    </div>

                    {/* Identity & Team Section */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2 group-hover:text-purple-400 transition-colors">
                                {player.username}
                            </h3>
                            <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-sm font-medium">
                                    {typeof player.teamId !== "string" && player.teamId ? (
                                        <span className="flex items-center gap-1.5">
                                            {player.teamId.teamName}
                                            <span className="text-white/20">#{player.teamId.tag}</span>
                                        </span>
                                    ) : "Free Agent"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section: Clean Grid */}
                    {player.playerStats && (
                        <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 mb-6 mt-auto">
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

                    {/* Integrated CTA Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">
                            Analyze Performance
                        </span>
                        <ChevronRight size={16} className="text-white/20 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </Link>
        </div>
    );
});

export default PlayerCard;
