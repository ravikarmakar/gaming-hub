import React from 'react';
import { Trophy, Users, Activity, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RoadmapStep {
    name?: string;
    title: string;
    status: 'pending' | 'ongoing' | 'completed';
    isFinale?: boolean;
    isLeague?: boolean;
    leagueType?: string;
    grandFinaleType?: string;
    [key: string]: any;
}

interface RoadmapTrackProps {
    steps: RoadmapStep[];
    colorScheme: 'purple' | 'rose' | 'blue';
    trackType: 'main' | 'invited' | 't1-special';
    eventDetails: any;
    mainRoadmap?: RoadmapStep[];
}

export const RoadmapTrack: React.FC<RoadmapTrackProps> = ({ 
    steps, 
    colorScheme, 
    trackType, 
    eventDetails,
    mainRoadmap = []
}) => {
    const getColors = () => {
        switch (colorScheme) {
            case 'rose': return 'rose';
            case 'blue': return 'blue';
            default: return 'purple';
        }
    };

    const color = getColors();

    return (
        <div className="bg-transparent p-0 sm:p-0 rounded-2xl">
            <div className={`relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-${color}-500/50 before:via-${color}-500/10 before:to-transparent`}>
                {steps.map((step, idx) => (
                    <div key={idx} className="relative group">
                        <div className={`absolute -left-[40px] w-7 h-7 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                            step.isFinale 
                                ? 'bg-amber-500 text-brand-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                : trackType === 'main' && step.isLeague 
                                    ? 'bg-indigo-500 text-white' 
                                    : `bg-${color}-500 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                        }`}>
                            {step.isFinale ? <Trophy size={12} /> : step.isLeague ? <Users size={12} /> : <Activity size={12} />}
                        </div>
                        <div className="bg-transparent border border-white/10 rounded-2xl p-5 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{step.name || `Round ${idx + 1}`}</p>
                                        <h4 className="text-lg font-black text-white tracking-tight">{step.title}</h4>
                                    </div>
                                    {step.status === 'completed' && (
                                        <div className="bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {step.status === 'completed' && (
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase text-[9px] font-black">
                                            Completed
                                        </Badge>
                                    )}
                                    {step.status === 'ongoing' && (
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[9px] font-black animate-pulse">
                                            Live now
                                        </Badge>
                                    )}
                                    
                                    {trackType === 'main' && step.isLeague && (
                                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 uppercase text-[9px] font-black">
                                            {step.leagueType?.replace(/-/g, " ") || "League Mode"}
                                        </Badge>
                                    )}
                                    
                                    {trackType !== 'main' && (() => {
                                        const mappingList = trackType === 'invited' 
                                            ? eventDetails.invitedRoundMappings 
                                            : eventDetails.t1SpecialRoundMappings;
                                            
                                        const mapping = mappingList?.find((m: any) => idx >= m.startRound && idx <= m.endRound);
                                        
                                        if (mapping) {
                                            const targetRound = mainRoadmap[mapping.targetMainRound];
                                            const sourceRoundTitle = step.title || step.name;
                                            const label = trackType === 'invited' ? 'Invited' : 'T1 Special';
                                            const labelColor = trackType === 'invited' ? 'text-rose-400' : 'text-blue-400';

                                            return (
                                                <Badge className="bg-white/5 text-gray-400 border-white/10 uppercase text-[9px] font-black flex items-center gap-1.5 py-1 px-2.5 rounded-lg border">
                                                    <span className={labelColor}>{label}</span>
                                                    <span className="text-gray-600 font-medium">({sourceRoundTitle})</span>
                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                        Merges <ArrowRight size={8} />
                                                    </span>
                                                    <span className="text-purple-400">Main</span>
                                                    {targetRound?.title && (
                                                        <span className="text-amber-400 font-bold ml-0.5">({targetRound.title})</span>
                                                    )}
                                                </Badge>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {step.isFinale && (
                                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[9px] font-black">
                                            {step.grandFinaleType?.replace(/-/g, " ") || "Grand Finale"}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
