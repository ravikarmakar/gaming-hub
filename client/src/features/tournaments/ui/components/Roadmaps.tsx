import { useMemo } from "react";
import {
    Users,
    Trophy,
    Activity,
    Map,
    ArrowRight,
    CheckCircle2,
    Zap
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useGetRoundsQuery } from "../../hooks";
import { Tournament, Round } from "../../types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RoadmapsProps {
    eventDetails: Tournament;
    showCTA?: boolean;
}

export const Roadmaps = ({ eventDetails, showCTA }: RoadmapsProps) => {
    const navigate = useNavigate();
    const { data: rounds = [] } = useGetRoundsQuery(eventDetails?._id || "");

    const isScrim = eventDetails?.eventType === 'scrims';

    const activeRoadmap = useMemo(() => {
        if (!eventDetails) return [];
        const roadmapData = eventDetails.roadmaps?.find(r => r.type === 'tournament')?.data || eventDetails.roadmap || [];

        return roadmapData.map((item: any) => {
            const actualRound = (rounds as Round[]).find((r: Round) =>
                (item.roundId && r._id === item.roundId) ||
                (!item.roundId && r.roundName === item.title)
            );
            return { ...item, status: actualRound?.status || 'pending' };
        });
    }, [eventDetails, rounds]);

    const activeInvitedRoadmap = useMemo(() => {
        if (!eventDetails) return [];
        const roadmapData = eventDetails.roadmaps?.find(r => r.type === 'invitedTeams')?.data || eventDetails.invitedTeamsRoadmap || [];

        return roadmapData.map((item: any) => {
            const actualRound = (rounds as Round[]).find((r: Round) =>
                (item.roundId && r._id === item.roundId) ||
                (!item.roundId && r.roundName === item.title)
            );
            return { ...item, status: actualRound?.status || 'pending' };
        });
    }, [eventDetails, rounds]);

    const activeT1Roadmap = useMemo(() => {
        if (!eventDetails) return [];
        const roadmapData = eventDetails.roadmaps?.find(r => r.type === 't1-special')?.data || [];

        return roadmapData.map((item: any) => {
            const actualRound = (rounds as Round[]).find((r: Round) =>
                (item.roundId && r._id === item.roundId) ||
                (!item.roundId && r.roundName === item.title)
            );
            return { ...item, status: actualRound?.status || 'pending' };
        });
    }, [eventDetails, rounds]);

    if (isScrim) return null;

    if (activeRoadmap.length === 0 && activeInvitedRoadmap.length === 0 && activeT1Roadmap.length === 0) {
        return (
            <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-rose-600/5 opacity-50" />
                
                <div className="relative flex flex-col items-center justify-center p-12 sm:p-20 text-center bg-transparent">
                    {/* Decorative Ring */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
                    
                    {/* Icon Stack */}
                    <div className="relative mb-8">
                        <div className="h-20 w-20 rounded-3xl bg-transparent border border-white/10 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <Map className="w-10 h-10 text-gray-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-xl bg-purple-600 border border-white/20 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-purple-600/40">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <h4 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">
                        Arena Roadmap <span className="text-purple-500">Pending</span>
                    </h4>
                    <p className="text-gray-400 max-w-sm mb-10 leading-relaxed font-medium">
                        The mission path has not been forged yet. Define the rounds and stages to guide players through the competition.
                    </p>

                    {showCTA ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Button
                                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30 shadow-[0_10px_25px_-5px_rgba(147,51,234,0.4)] transition-all font-black tracking-[0.1em] uppercase text-[10px] px-8 py-6 h-auto rounded-2xl group/btn"
                                onClick={() => navigate(`${ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", eventDetails._id)}?tab=roadmap`)}
                            >
                                <Plus className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-90" />
                                Initialize Roadmap
                            </Button>
                        </div>
                    ) : (
                        <Badge variant="outline" className="border-white/10 text-gray-500 bg-white/5 px-6 py-2 rounded-full font-bold tracking-widest uppercase text-[9px]">
                            Awaiting Organizer Setup
                        </Badge>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Map className="w-4 h-4 text-purple-400" />
                    Tournament Progression
                </h3>
                {(activeInvitedRoadmap.length > 0 || activeT1Roadmap.length > 0) && (
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest px-3 h-7">
                        {(activeRoadmap.length > 0 ? 1 : 0) + (activeInvitedRoadmap.length > 0 ? 1 : 0) + (activeT1Roadmap.length > 0 ? 1 : 0)} Tracks Active
                    </Badge>
                )}
            </div>

            <Tabs defaultValue="main" className="w-full">
                <TabsList className="bg-transparent p-0 mb-6 gap-2">
                    <TabsTrigger value="main" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all h-8">
                        Main Roadmap
                    </TabsTrigger>
                    {activeInvitedRoadmap.length > 0 && (
                        <TabsTrigger value="invited" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all h-8">
                            Invited Roadmap
                        </TabsTrigger>
                    )}
                    {activeT1Roadmap.length > 0 && (
                        <TabsTrigger value="t1-special" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all h-8">
                            T1 Special
                        </TabsTrigger>
                    )}
                </TabsList>

                <div className="grid grid-cols-1 gap-8">
                    <TabsContent value="main" className="m-0 focus-visible:ring-0">
                        <div className="bg-transparent p-0 sm:p-0 rounded-2xl">
                            <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-purple-500/50 before:via-purple-500/10 before:to-transparent">
                                {activeRoadmap.map((step: any, idx: number) => (
                                    <div key={idx} className="relative group">
                                        <div className={`absolute -left-[40px] w-7 h-7 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.isFinale ? 'bg-amber-500 text-brand-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : step.isLeague ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
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
                                                    {step.isLeague && (
                                                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 uppercase text-[9px] font-black">
                                                            {step.leagueType?.replaceAll("-", " ") || "League Mode"}
                                                        </Badge>
                                                    )}
                                                    {step.isFinale && (
                                                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[9px] font-black">
                                                            {step.grandFinaleType?.replaceAll("-", " ") || "Grand Finale"}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {activeInvitedRoadmap.length > 0 && (
                        <TabsContent value="invited" className="m-0 focus-visible:ring-0">
                            <div className="bg-transparent p-0 sm:p-0 rounded-2xl">
                                <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-rose-500/50 before:via-rose-500/10 before:to-transparent">
                                    {activeInvitedRoadmap.map((step: any, idx: number) => (
                                        <div key={idx} className="relative group">
                                            <div className={`absolute -left-[40px] w-7 h-7 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.isFinale ? 'bg-amber-500 text-brand-black' : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}>
                                                {step.isFinale ? <Trophy size={12} /> : <Users size={12} />}
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
                                                        {(() => {
                                                            const mapping = eventDetails.invitedRoundMappings?.find((m: any) => idx >= m.startRound && idx <= m.endRound);
                                                            if (mapping) {
                                                                const targetRound = activeRoadmap[mapping.targetMainRound];
                                                                const sourceRoundTitle = step.title || step.name;

                                                                return (
                                                                    <Badge className="bg-white/5 text-gray-400 border-white/10 uppercase text-[9px] font-black flex items-center gap-1.5 py-1 px-2.5 rounded-lg border">
                                                                        <span className="text-rose-400">Invited</span>
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
                                                        {step.status === 'ongoing' && (
                                                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[9px] font-black animate-pulse">
                                                                Live now
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {activeT1Roadmap.length > 0 && (
                        <TabsContent value="t1-special" className="m-0 focus-visible:ring-0">
                            <Card className="bg-black/20 border-white/5 p-6 sm:p-8 rounded-2xl">
                                <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-blue-500/50 before:via-blue-500/10 before:to-transparent">
                                    {activeT1Roadmap.map((step: any, idx: number) => (
                                        <div key={idx} className="relative group">
                                            <div className={`absolute -left-[40px] w-7 h-7 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.isFinale ? 'bg-amber-500 text-brand-black' : 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}>
                                                {step.isFinale ? <Trophy size={11} /> : <Zap size={10} />}
                                            </div>
                                            <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-5 transition-all duration-300">
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
                                                        {(() => {
                                                            const mapping = eventDetails.t1SpecialRoundMappings?.find((m: any) => idx >= m.startRound && idx <= m.endRound);
                                                            if (mapping) {
                                                                const targetRound = activeRoadmap[mapping.targetMainRound];
                                                                const sourceRoundTitle = step.title || step.name;

                                                                return (
                                                                    <Badge className="bg-white/5 text-gray-400 border-white/10 uppercase text-[9px] font-black flex items-center gap-1.5 py-1 px-2.5 rounded-lg border">
                                                                        <span className="text-blue-400">T1 Special</span>
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
                                                        {step.status === 'ongoing' && (
                                                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[9px] font-black animate-pulse">
                                                                Live now
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
};
