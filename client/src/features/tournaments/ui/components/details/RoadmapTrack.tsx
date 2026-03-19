import React from 'react';
import { Trophy, Users, Activity } from "lucide-react";
import { RoundItem } from "../management/rounds/RoundItem";

interface RoadmapStep {
    _id?: string;
    roundName?: string;
    roundNumber: number;
    status: 'pending' | 'ongoing' | 'completed';
    isFinale?: boolean;
    isLeague?: boolean;
    leagueType?: string;
    grandFinaleType?: string;
    isPlaceholder?: boolean;
    mergeInfo?: any;
    [key: string]: any;
}

interface RoadmapTrackProps {
    steps: RoadmapStep[];
    colorScheme: 'purple' | 'rose' | 'blue';
    trackType: 'main' | 'invited' | 't1-special';
    isLoading?: boolean;
}

export const RoadmapTrack: React.FC<RoadmapTrackProps> = ({
    steps,
    colorScheme,
    trackType,
    isLoading = false,
}) => {
    const colorClasses: Record<string, string> = {
        purple: "before:from-purple-500/50 before:via-purple-500/10",
        rose: "before:from-rose-500/50 before:via-rose-500/10",
        blue: "before:from-blue-500/50 before:via-blue-500/10"
    };

    const dotClasses: Record<string, string> = {
        purple: "bg-purple-500",
        rose: "bg-rose-500",
        blue: "bg-blue-500"
    };

    return (
        <div className="bg-transparent p-0 sm:p-0 rounded-2xl">
            <div className={`relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-r ${colorClasses[colorScheme] || colorClasses.purple} before:to-transparent`}>
                {isLoading ? (
                    <div className="flex items-center gap-3 py-4">
                        <div className="w-4 h-4 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest animate-pulse">
                            Loading Roadmap...
                        </span>
                    </div>
                ) : (
                    steps.map((step, idx) => {
                        const isLeague = step.isLeague || step.roadmapData?.isLeague;
                        return (
                            <div key={step._id || idx} className="relative group">
                                {/* Status Icon Indicator */}
                                <div className={`absolute -left-[40px] w-7 h-7 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.isFinale
                                    ? 'bg-amber-500 text-brand-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                    : trackType === 'main' && isLeague
                                        ? 'bg-indigo-500 text-white'
                                        : `${dotClasses[colorScheme] || dotClasses.purple} text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                                    }`}>
                                    {step.isFinale ? <Trophy size={12} /> : isLeague ? <Users size={12} /> : <Activity size={12} />}
                                </div>

                                {/* Reusable Round Item */}
                                <RoundItem
                                    round={step}
                                    activeRoundTab={trackType === 'invited' ? 'invited-tournament' : trackType === 't1-special' ? 't1-special' : 'tournament'}
                                    isReadOnly={true}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
