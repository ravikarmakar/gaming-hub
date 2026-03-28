import { useMemo } from 'react';
import { Round, Tournament, RoadmapDisplayItem, RoadmapTrackType } from '@/features/tournaments/types';
import { reconcileRoadmap } from '../lib/RoadmapEngine';

/**
 * useTournamentRoadmap hook is now a lightweight wrapper around the RoadmapEngine.
 * It provides reactive reconciliation of tournament roadmap data.
 */
export const useTournamentRoadmap = (
    event: Tournament | undefined,
    rounds: Round[],
    trackType: RoadmapTrackType
): { roadmapItems: RoadmapDisplayItem[] } => {
    const roadmapItems = useMemo(() => {
        return reconcileRoadmap(event, rounds, trackType);
    }, [event, rounds, trackType]);

    return { roadmapItems };
};
