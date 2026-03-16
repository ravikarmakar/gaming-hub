import React from "react";
import { cn } from "@/lib/utils";

interface RoadmapItem {
    name?: string;
    title?: string;
    isLeague?: boolean;
    leagueType?: string;
}

interface RoadmapDisplaySectionProps {
    rounds: RoadmapItem[];
    accentColor?: "amber" | "purple" | "indigo" | "rose";
    className?: string;
}

export const RoadmapDisplaySection: React.FC<RoadmapDisplaySectionProps> = ({
    rounds,
    accentColor = "amber",
    className
}) => {
    const accentBorder = accentColor === "amber" 
        ? "hover:border-amber-500/20" 
        : accentColor === "purple" 
            ? "hover:border-purple-500/20" 
            : accentColor === "rose"
                ? "hover:border-rose-500/20"
                : "hover:border-indigo-500/20";

    const accentBadgeBg = accentColor === "amber" 
        ? "bg-amber-500/10 text-amber-500" 
        : accentColor === "purple" 
            ? "bg-purple-500/10 text-purple-500" 
            : accentColor === "rose"
                ? "bg-rose-500/10 text-rose-500"
                : "bg-indigo-500/10 text-indigo-500";

    const accentBadgeBgLeague = accentColor === "rose" 
    ? "bg-rose-500/20 text-rose-400 border-rose-500/20" 
    : accentColor === "indigo"
        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/20"
        : accentColor === "purple"
            ? "bg-purple-500/20 text-purple-400 border-purple-500/20"
            : "bg-amber-500/20 text-amber-400 border-amber-500/20";

    return (
        <div className={cn("space-y-2", className)}>
            {rounds.map((round, index) => (
                <div 
                    key={index} 
                    className={cn(
                        "flex items-center gap-3 py-2 px-4 bg-white/[0.02] border border-transparent rounded-lg transition-all group",
                        accentBorder
                    )}
                >
                    <div className="flex items-center gap-2 min-w-[80px]">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Round {index + 1}
                        </span>
                        <span className="text-gray-700 font-bold">→</span>
                    </div>
                    <span className="text-[11px] font-bold text-white tracking-wide">
                        {round.title || `Round ${index + 1}`}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        {round.leagueType === "18-teams" && (
                            <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter", accentBadgeBg)}>
                                18 Teams
                            </span>
                        )}
                        {round.isLeague && (
                            <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter", accentBadgeBgLeague)}>
                                League Mode
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
