import { useMemo } from 'react';
import { Round, Tournament } from '@/features/tournaments/types';

export type RoadmapTrackType = 'tournament' | 'invitedTeams' | 't1-special';

export interface RoadmapDisplayItem extends Round {
    roadmapIndex: number;
    roadmapData: any;
    isDisabled: boolean;
    mergeInfo: any;
    isPlaceholder: boolean;
}

export const useTournamentRoadmap = (
    event: Tournament | undefined,
    rounds: Round[],
    trackType: RoadmapTrackType
): { roadmapItems: RoadmapDisplayItem[] } => {
    const roadmapItems = useMemo(() => {
        if (!event) return [];

        // Map tracked type in rounds filter to roadmap type
        const roundTypeFilter = trackType === 'invitedTeams' ? 'invited-tournament' : trackType;
        // Keep all rounds for mapping lookup, but use actualRounds for placeholder association
        const actualRounds = rounds;

        const roadmap = event.roadmaps?.find((r: any) => r.type === trackType);

        if (!roadmap || !roadmap.data || roadmap.data.length === 0) {
            // Fallback: If no roadmap data, use actual rounds of this type
            return rounds
                .filter(r => (r.type || 'tournament') === roundTypeFilter)
                .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0))
                .map((round, index) => ({
                    ...round,
                    roadmapIndex: index,
                    roadmapData: null,
                    isDisabled: false,
                    mergeInfo: round.mergeInfo || null,
                    isPlaceholder: false
                }));
        }

        const getStrId = (id: any) => {
            if (!id) return "";
            if (typeof id === 'string') return id;
            if (id.$oid) return id.$oid;
            return String(id);
        };

        return (roadmap.data || []).map((item: any, index: number) => {
            const targetId = getStrId(item.roundId);
            const linkedRound = actualRounds.find(r => {
                const rId = getStrId(r._id);
                return (targetId && rId === targetId) ||
                       (!targetId && r.roundName === item.title && (r.type || 'tournament') === roundTypeFilter);
            });

            const isFirst = index === 0;
            const prevItem = index > 0 ? (roadmap.data[index - 1]) : null;
            const prevTargetId = getStrId(prevItem?.roundId);
            const prevRound = index > 0 ? actualRounds.find(r => {
                const rId = getStrId(r._id);
                return (prevTargetId && rId === prevTargetId) ||
                       (!prevTargetId && r.roundName === prevItem?.title && (r.type || 'tournament') === roundTypeFilter);
            }) : null;


            const isPlaceholder = !linkedRound;
            const isDisabled = isPlaceholder && (!isFirst && (!prevRound || prevRound.status !== 'completed'));
            
            // Reconcile status: favor actual round status, fallback to roadmap status
            const currentStatus = (linkedRound?.status || item.status || 'pending') as 'pending' | 'ongoing' | 'completed';

            // Calculate Merge Info
            let mergeInfo = null;
            if (trackType === 'invitedTeams' && (event.invitedRoundMappings?.length || 0) > 0) {
                // Check if this invited round merges into a main round
                const mapping = event.invitedRoundMappings?.find((m: any) => m.sourceRound?.roundNumber === index + 1);
                if (mapping) {
                    const tournamentRoadmap = event.roadmaps?.find((r: any) => r.type === 'tournament');
                    const targetRound = tournamentRoadmap?.data?.[mapping.targetMainRound.roundNumber - 1];
                    mergeInfo = {
                        type: 'merges-into',
                        targetLabel: `Round ${mapping.targetMainRound.roundNumber}`,
                        targetTitle: targetRound?.title || "",
                        targetIndex: mapping.targetMainRound.roundNumber
                    };
                }
            } else if (trackType === 't1-special' && (event.t1SpecialRoundMappings?.length || 0) > 0) {
                // Check if this T1 special round merges into a main round
                const mapping = event.t1SpecialRoundMappings?.find((m: any) => m.sourceRound?.roundNumber === index + 1);
                if (mapping) {
                    const tournamentRoadmap = event.roadmaps?.find((r: any) => r.type === 'tournament');
                    const targetRound = tournamentRoadmap?.data?.[mapping.targetMainRound.roundNumber - 1];
                    mergeInfo = {
                        type: 'merges-into',
                        targetLabel: `Round ${mapping.targetMainRound.roundNumber}`,
                        targetTitle: targetRound?.title || "",
                        targetIndex: mapping.targetMainRound.roundNumber
                    };
                }
            } else if (trackType === 'tournament') {
                // Check if this main round receives teams from invited or t1-special rounds
                if (linkedRound && linkedRound.mergeInfo) {
                    mergeInfo = {
                        ...linkedRound.mergeInfo,
                        type: 'receives-from'
                    };
                } else {
                    const invMappings = (event.invitedRoundMappings || []).filter((m: any) => m.targetMainRound?.roundNumber === index + 1);
                    const t1Mappings = (event.t1SpecialRoundMappings || []).filter((m: any) => m.targetMainRound?.roundNumber === index + 1);

                    if (invMappings.length > 0 || t1Mappings.length > 0) {
                        const invitedRoadmap = event.roadmaps?.find((r: any) => r.type === 'invitedTeams');
                        const t1Roadmap = event.roadmaps?.find((r: any) => r.type === 't1-special');

                        const sources = [
                            ...invMappings.map((m: any) => ({
                                type: 'invited',
                                name: m.sourceRound?.roundName || invitedRoadmap?.data?.[m.sourceRound?.roundNumber - 1]?.title || `Invited Round ${m.sourceRound?.roundNumber}`
                            })),
                            ...t1Mappings.map((m: any) => ({
                                type: 't1-special',
                                name: m.sourceRound?.roundName || t1Roadmap?.data?.[m.sourceRound?.roundNumber - 1]?.title || `T1 Round ${m.sourceRound?.roundNumber}`
                            }))
                        ];

                        mergeInfo = {
                            type: 'receives-from',
                            sources
                        };
                    }
                }
            }

            if (linkedRound) {
                return {
                    ...linkedRound,
                    roundName: `Round ${index + 1} - ${linkedRound.roundName.replace(/^Round \d+ - /, '')}`,
                    roundNumber: index + 1,
                    roadmapIndex: index,
                    roadmapData: item,
                    status: currentStatus,
                    isDisabled,
                    mergeInfo,
                    isPlaceholder: false
                };
            }
            return {
                _id: `placeholder-${index}`,
                roundName: `Round ${index + 1} - ${item.title.replace(/^Round \d+ - /, '')}`,
                roundNumber: index + 1,
                status: currentStatus,
                groups: [],
                isPlaceholder: true,
                roadmapIndex: index,
                type: roundTypeFilter,
                roadmapData: item,
                isDisabled,
                mergeInfo
            } as RoadmapDisplayItem;
        });
    }, [event, rounds, trackType]);

    return { roadmapItems };
};
