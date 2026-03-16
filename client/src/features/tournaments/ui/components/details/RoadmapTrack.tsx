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
}

export const RoadmapTrack: React.FC<RoadmapTrackProps> = ({
    steps,
    colorScheme,
    trackType,
}) => {
    const color = colorScheme;

    return (
        <div className="bg-transparent p-0 sm:p-0 rounded-2xl">
            <div className={`relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-r before:from-${color}-500/50 before:via-${color}-500/10 before:to-transparent`}>
                {steps.map((step, idx) => (
                    <div key={step._id || idx} className="relative group">
                        {/* Status Icon Indicator */}
                        <div className={`absolute -left-[40px] w-7 h-7 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.isFinale
                            ? 'bg-amber-500 text-brand-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : trackType === 'main' && step.isLeague
                                ? 'bg-indigo-500 text-white'
                                : `bg-${color}-500 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                            }`}>
                            {step.isFinale ? <Trophy size={12} /> : step.isLeague ? <Users size={12} /> : <Activity size={12} />}
                        </div>

                        {/* Reusable Round Item */}
                        <RoundItem
                            round={step}
                            activeRoundTab={trackType === 'invited' ? 'invited-tournament' : trackType === 't1-special' ? 't1-special' : 'tournament'}
                            isReadOnly={true}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
