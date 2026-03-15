import { useMemo } from "react";
import { Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useGetRoundsQuery } from "@/features/tournaments/hooks";
import { Tournament, Round } from "@/features/tournaments/types";

import { RoadmapEmptyState } from "./RoadmapEmptyState";
import { RoadmapTrack } from "./RoadmapTrack";

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
            <RoadmapEmptyState 
                showCTA={showCTA} 
                onInitialize={() => navigate(`${ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", eventDetails._id)}?tab=roadmap`)}
            />
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
                        <RoadmapTrack 
                            steps={activeRoadmap} 
                            colorScheme="purple" 
                            trackType="main"
                            eventDetails={eventDetails}
                        />
                    </TabsContent>

                    {activeInvitedRoadmap.length > 0 && (
                        <TabsContent value="invited" className="m-0 focus-visible:ring-0">
                            <RoadmapTrack 
                                steps={activeInvitedRoadmap} 
                                colorScheme="rose" 
                                trackType="invited"
                                eventDetails={eventDetails}
                                mainRoadmap={activeRoadmap}
                            />
                        </TabsContent>
                    )}

                    {activeT1Roadmap.length > 0 && (
                        <TabsContent value="t1-special" className="m-0 focus-visible:ring-0">
                            <RoadmapTrack 
                                steps={activeT1Roadmap} 
                                colorScheme="blue" 
                                trackType="t1-special"
                                eventDetails={eventDetails}
                                mainRoadmap={activeRoadmap}
                            />
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
};
