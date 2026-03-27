import { Round, Tournament, RoadmapDisplayItem, RoadmapTrackType, MergeInfo, MergeSource, Group } from '../types';

/**
 * RoadmapEngine is responsible for reconciling raw roadmap data from the tournament
 * with actual round data fetched from the API.
 * 
 * It handles:
 * 1. Linking roadmap items to actual rounds.
 * 2. Determining placeholder states.
 * 3. Calculating complex merge logic (receives-from / merges-into).
 * 4. Resolving status and disabled states based on previous round completion.
 */
/**
 * Helper to safely get a string ID from various formats ($oid, string, object).
 */
const getStrId = (id: any): string => {
    if (!id) return "";
    if (typeof id === 'string') return id;
    if (id?.$oid) return id.$oid;
    return String(id);
};

/**
 * Logic to find which actual round corresponds to a roadmap item.
 */
const findLinkedRound = (item: any, rounds: Round[], roundTypeFilter: string): Round | undefined => {
    const targetId = getStrId(item.roundId);
    return rounds.find(r => {
        const rId = getStrId(r._id);
        // Matching by ID is preferred, fallback to title + type matching for unlinked roadmap items
        return (targetId && rId === targetId) ||
               (!targetId && r.roundName === item.title && (r.type || 'tournament') === roundTypeFilter);
    });
};

/**
 * Complex logic for calculating cross-track round merges.
 */
const calculateMergeInfo = (
    event: Tournament,
    trackType: RoadmapTrackType,
    index: number,
    linkedRound?: Round
): MergeInfo | null => {
    if (trackType === 'invitedTeams' || trackType === 't1-special') {
        const mappings = trackType === 'invitedTeams' ? event.invitedRoundMappings : event.t1SpecialRoundMappings;
        if (!mappings || mappings.length === 0) return null;

        // Check if this source round merges into a main round
        const mapping = mappings.find((m) => m.sourceRound?.roundNumber === index + 1);
        if (mapping) {
            const tournamentRoadmap = event.roadmaps?.find((r) => r.type === 'tournament');
            const targetRound = tournamentRoadmap?.data?.[mapping.targetMainRound.roundNumber - 1];
            return {
                type: 'merges-into',
                targetLabel: `Round ${mapping.targetMainRound.roundNumber}`,
                targetTitle: targetRound?.title || "",
                targetIndex: mapping.targetMainRound.roundNumber
            };
        }
    } else if (trackType === 'tournament') {
        // Check if this main round receives teams from invited or t1-special rounds
        if (linkedRound && linkedRound.mergeInfo) {
            return {
                ...linkedRound.mergeInfo,
                type: 'receives-from'
            };
        }

        const invMappings = (event.invitedRoundMappings || []).filter((m) => m.targetMainRound?.roundNumber === index + 1);
        const t1Mappings = (event.t1SpecialRoundMappings || []).filter((m) => m.targetMainRound?.roundNumber === index + 1);

        if (invMappings.length > 0 || t1Mappings.length > 0) {
            const invitedRoadmap = event.roadmaps?.find((r) => r.type === 'invitedTeams');
            const t1Roadmap = event.roadmaps?.find((r) => r.type === 't1-special');

            const sources: MergeSource[] = [
                ...invMappings.map((m) => ({
                    type: 'invited' as const,
                    name: m.sourceRound?.roundName || invitedRoadmap?.data?.[m.sourceRound?.roundNumber - 1]?.title || `Invited Round ${m.sourceRound?.roundNumber}`
                })),
                ...t1Mappings.map((m) => ({
                    type: 't1-special' as const,
                    name: m.sourceRound?.roundName || t1Roadmap?.data?.[m.sourceRound?.roundNumber - 1]?.title || `T1 Round ${m.sourceRound?.roundNumber}`
                }))
            ];

            return {
                type: 'receives-from',
                sources,
                hasInvitedMapping: invMappings.length > 0,
                hasT1Mapping: t1Mappings.length > 0
            };
        }
    }

    return null;
};

/**
 * Reconciles the roadmap for a specific track type.
 */
export const reconcileRoadmap = (
    event: Tournament | undefined,
    rounds: Round[],
    trackType: RoadmapTrackType
): RoadmapDisplayItem[] => {
    if (!event) return [];

    const roundTypeFilter = trackType === 'invitedTeams' ? 'invited-tournament' : trackType;
    const roadmap = event.roadmaps?.find((r) => r.type === trackType);

    // Fallback: If no roadmap data exists, use actual rounds of this type
    if (!roadmap || !roadmap.data || roadmap.data.length === 0) {
        return rounds
            .filter(r => (r.type || 'tournament') === roundTypeFilter)
            .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0))
            .map((round, index) => ({
                ...round,
                roadmapIndex: index,
                roadmapData: undefined,
                isDisabled: false,
                mergeInfo: round.mergeInfo || null,
                isPlaceholder: false
            })) as RoadmapDisplayItem[];
    }

    return (roadmap.data || []).map((item, index: number) => {
        const linkedRound = findLinkedRound(item, rounds, roundTypeFilter);

        const isFirst = index === 0;
        const prevItem = index > 0 ? (roadmap.data[index - 1]) : null;
        const prevRound = prevItem ? findLinkedRound(prevItem, rounds, roundTypeFilter) : null;

        const isPlaceholder = !linkedRound;
        // A placeholder is disabled if it's not the first one and the previous round isn't completed
        const isDisabled = isPlaceholder && (!isFirst && (!prevRound || prevRound.status !== 'completed'));
        
        // Favor actual round status, fallback to roadmap status
        const currentStatus = (linkedRound?.status || item.status || 'pending') as 'pending' | 'ongoing' | 'completed';

        const mergeInfo = calculateMergeInfo(event, trackType, index, linkedRound);

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
            } as RoadmapDisplayItem;
        }

        return {
            _id: `placeholder-${index}`,
            roundName: `Round ${index + 1} - ${item.title || `Round ${index + 1}`}`,
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
};

/**
 * Calculates the effective total match count for a group/round.
 */
export const calculateEffectiveMatchCount = (group: Group | null, round: Round | null): number => {
    const rm = round?.matchesPerGroup;
    const isLeague = round?.isLeague || group?.isLeague;
    
    if (group?.totalMatch && group.totalMatch > 0) {
        return group.totalMatch;
    }
    
    if (isLeague) {
        return rm ? rm * 3 : 18;
    }
    
    return rm || 1;
};

/**
 * Calculates the expected qualifying teams count.
 */
export const calculateQualifyingTeams = (group: Group | null, round: Round | null): number => {
    return round?.qualifyingTeams || group?.totalSelectedTeam || 0;
};

/**
 * Determines if a round/group has incoming merge mappings.
 */
export const hasIncomingMerges = (round: Round | null): boolean => {
    return round?.mergeInfo?.type === 'receives-from';
};
