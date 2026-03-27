import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Trophy, ShieldCheck, Gamepad2, Globe, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { Team } from "@/features/teams/lib/types";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";

interface TeamCardProps {
    team: Team;
    index: number;
}

const TeamCard = React.memo(React.forwardRef<HTMLDivElement, TeamCardProps>(({ team }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div ref={ref} className="group relative h-full">
            <Link
                to={TEAM_ROUTES.PROFILE.replace(":id", team._id)}
                className="block h-full transition-all duration-500"
            >
                <GlassCard className="h-full flex flex-row sm:flex-col p-0 overflow-hidden hover:border-purple-500/30 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]">
                    {/* Subtle Top Shine */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Header: Logo + Info */}
                    <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-6 sm:pb-4 flex-1 min-w-0">
                        {/* Logo */}
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#0d0d0d] border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 p-0.5">
                                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden relative">
                                    {!isLoaded && team.imageUrl && (
                                        <Skeleton className="absolute inset-0 z-20 w-full h-full rounded-full bg-white/10 animate-pulse" />
                                    )}
                                    {team.imageUrl ? (
                                        <img
                                            src={team.imageUrl}
                                            alt={team.teamName}
                                            onLoad={() => setIsLoaded(true)}
                                            onError={() => setIsLoaded(true)}
                                            loading="lazy"
                                            className={cn(
                                                "w-full h-full object-cover transition-all duration-500 grayscale-[0.2] group-hover:grayscale-0",
                                                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                                            )}
                                        />
                                    ) : (
                                        <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" />
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 p-0.5 sm:p-1 rounded-full bg-purple-600 border border-white/10 shadow-lg">
                                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                        </div>

                        {/* Name & Tag */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-purple-400 transition-colors truncate leading-tight">
                                    {team.teamName}
                                </h3>
                                {(team.type === "org" || team.type === "team") && (
                                    <span className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-[7px] sm:text-[8px] font-black text-white/60 uppercase tracking-widest leading-none">
                                        {team.type}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] sm:text-xs text-white/30 font-medium tracking-wider font-mono">
                                    #{team.tag}
                                </span>
                                {/* Mobile Stats Summary */}
                                <div className="flex items-center gap-2 sm:hidden">
                                    <div className="flex items-center gap-1 text-[9px] text-white/40">
                                        <Users size={10} className="text-purple-500/50" />
                                        <span>{team.teamMembers?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col gap-1 sm:gap-1.5 flex-shrink-0">
                            {team.isVerified && (
                                <div className="p-1 sm:p-1.5 rounded-full bg-blue-600 text-white shadow-lg" title="Verified Team">
                                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </div>
                            )}
                            {team.isRecruiting && (
                                <div className="p-1 sm:p-1.5 rounded-full bg-emerald-600 text-white shadow-lg" title="Recruiting">
                                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Team Bio (Desktop only) */}
                    <div className="hidden sm:block mx-6 px-4 py-3 rounded-xl bg-white/5 mb-4 border border-white/5">
                        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed italic">
                            "{team.bio || "Building a legacy in the arena..."}"
                        </p>
                    </div>

                    {/* Stats (Desktop only) */}
                    <div className="hidden sm:grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 mx-6 mb-6 mt-auto">
                        <div className="bg-[#080808] p-4 group/metric hover:bg-[#0c0c0c] transition-colors">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                                <Users size={10} className="text-white/20" /> Members
                            </p>
                            <p className="text-xl font-black text-white tracking-tight">{team.teamMembers?.length || 0}</p>
                        </div>
                        <div className="bg-[#080808] p-4 group/metric hover:bg-[#0c0c0c] transition-colors">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                                <Trophy size={10} className="text-white/20" /> Tourneys
                            </p>
                            <p className="text-xl font-black text-white tracking-tight">{team.playedTournaments?.length || 0}</p>
                        </div>
                    </div>

                    {/* Footer (Desktop only) */}
                    <div className="hidden sm:flex items-center justify-between pt-4 border-t border-white/[0.05] mx-6 mb-6">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">
                            Team Profile
                        </span>
                        <ChevronRight size={16} className="text-white/20 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                </GlassCard>
            </Link>
        </div>
    );
}));

TeamCard.displayName = "TeamCard";

export default TeamCard;
