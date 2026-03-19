import { useState } from "react";
import { Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useGetRoundsQuery, useTournamentRoadmap } from "@/features/tournaments/hooks";
import { Tournament, Round, RoundTabType } from "@/features/tournaments/types";

import { RoadmapEmptyState } from "./RoadmapEmptyState";
import { RoadmapTrack } from "./RoadmapTrack";
import { RoadmapTabs } from "./RoadmapTabs";

interface RoadmapsProps {
    eventDetails: Tournament;
    showCTA?: boolean;
    rounds?: Round[];
    useEventDataOnly?: boolean;
}

export const Roadmaps = ({ eventDetails, showCTA, rounds: manualRounds, useEventDataOnly }: RoadmapsProps) => {
    const navigate = useNavigate();

    // Only fetch if manualRounds are not provided AND useEventDataOnly is not true
    const { data: fetchedRounds = [], isLoading: isRoundsLoading, isFetching: isRoundsFetching } = useGetRoundsQuery(eventDetails?._id || "", {
        enabled: !manualRounds && !useEventDataOnly && !!eventDetails?._id
    });

    const isDataLoading = !useEventDataOnly && !manualRounds && (isRoundsLoading || isRoundsFetching);

    const rounds = manualRounds || fetchedRounds;
    const [activeTrack, setActiveTrack] = useState<RoundTabType>("tournament");

    const { roadmapItems: mainRoadmap } = useTournamentRoadmap(eventDetails, rounds, 'tournament');
    const { roadmapItems: invitedRoadmap } = useTournamentRoadmap(eventDetails, rounds, 'invitedTeams');
    const { roadmapItems: t1Roadmap } = useTournamentRoadmap(eventDetails, rounds, 't1-special');

    const isScrim = eventDetails?.eventType === 'scrims';

    if (isScrim) return null;

    if (mainRoadmap.length === 0 && invitedRoadmap.length === 0 && t1Roadmap.length === 0) {
        return (
            <RoadmapEmptyState
                showCTA={showCTA}
                onInitialize={() => navigate(`${ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", eventDetails._id)}?tab=roadmap`)}
            />
        );
    }

    const currentSteps = activeTrack === 'tournament'
        ? mainRoadmap
        : activeTrack === 'invited-tournament'
            ? invitedRoadmap
            : t1Roadmap;

    const colorScheme = activeTrack === 'tournament'
        ? 'purple'
        : activeTrack === 'invited-tournament'
            ? 'rose'
            : 'blue';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Map className="w-4 h-4 text-purple-400" />
                    Tournament Progression
                </h3>
                {(invitedRoadmap.length > 0 || t1Roadmap.length > 0) && (
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest px-3 h-7">
                        {(mainRoadmap.length > 0 ? 1 : 0) + (invitedRoadmap.length > 0 ? 1 : 0) + (t1Roadmap.length > 0 ? 1 : 0)} Tracks Active
                    </Badge>
                )}
            </div>

            <RoadmapTabs
                activeTab={activeTrack}
                onTabChange={setActiveTrack}
                showInvited={invitedRoadmap.length > 0}
                showT1Special={t1Roadmap.length > 0}
            />

            <div className="grid grid-cols-1">
                <RoadmapTrack
                    steps={currentSteps as any}
                    colorScheme={colorScheme}
                    trackType={activeTrack === 'invited-tournament' ? 'invited' : activeTrack === 't1-special' ? 't1-special' : 'main'}
                    isLoading={isDataLoading}
                />
            </div>
        </div>
    );
};
