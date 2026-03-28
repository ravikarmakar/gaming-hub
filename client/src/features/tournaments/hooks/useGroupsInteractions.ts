import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    useGetLeaderboardQuery,
    useMergeTeamsToGroupMutation,
} from './';
import { Group, Round, LeaguePairingType } from '../types';
import { useGroupNavigation } from './useGroupNavigation';
import { useGroupResults } from './useGroupResults';
import { 
    calculateEffectiveMatchCount, 
    calculateQualifyingTeams, 
    hasIncomingMerges 
} from '../lib/RoadmapEngine';

interface UseGroupsInteractionsProps {
    rounds: Round[];
    groups: Group[];
    roundId: string;
    eventId: string;
    isLoading: boolean;
}

/**
 * Orchestrator hook for group interactions.
 * Composes specialized hooks for navigation, and results.
 */
export const useGroupsInteractions = ({ rounds, groups, roundId, eventId, isLoading }: UseGroupsInteractionsProps) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    
    // 1. Specialized Hooks
    const results = useGroupResults(eventId, selectedGroupId);
    
    const handleSetSelectedGroup = useCallback((group: Group | null) => {
        setSelectedGroupId(group ? group._id : null);
    }, []);

    const currentGroupObj = useMemo(() => 
        groups.find(g => String(g._id) === String(selectedGroupId)) || null
    , [groups, selectedGroupId]);

    const navigation = useGroupNavigation(groups, currentGroupObj, handleSetSelectedGroup);

    // 2. Data Queries & Mutations
    const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetLeaderboardQuery(selectedGroupId ?? "");
    const { mutateAsync: mergeTeamsToGroup, isPending: isMergingToGroup } = useMergeTeamsToGroupMutation();

    // 3. Derived State Logic
    const { currentGroup, effectiveTotalMatch, isGroupCompleted, roundMatches, qualifyingTeams, showMerge } = useMemo(() => {
        const round = rounds.find(r => String(r._id) === String(roundId)) || null;
        const group = currentGroupObj;

        return {
            currentGroup: group,
            effectiveTotalMatch: calculateEffectiveMatchCount(group, round),
            isGroupCompleted: group?.status === 'completed',
            roundMatches: round?.matchesPerGroup,
            qualifyingTeams: calculateQualifyingTeams(group, round),
            showMerge: hasIncomingMerges(round)
        };
    }, [rounds, currentGroupObj, roundId]);

    // 4. Synchronization & Lifecycle Effects
    
    // Initialize tempResults when entering results mode
    useEffect(() => {
        if (!results.isResultsMode) {
            if (Object.keys(results.tempResults).length > 0) {
                results.setTempResults({});
            }
            return;
        }

        if (leaderboard?.teamScore && Object.keys(results.tempResults).length === 0) {
            const newResults: Record<string, { kills: number, rank: number }> = {};
            leaderboard.teamScore.forEach(t => {
                newResults[t.teamId._id] = { kills: 0, rank: 0 };
            });
            results.setTempResults(newResults);
        }
    }, [leaderboard, results.isResultsMode, results.setTempResults]);

    // Reset selection when round changes
    useEffect(() => {
        setSelectedGroupId(null);
        results.setIsResultsMode(false);
    }, [roundId, results.setIsResultsMode]);

    // Track the index of the selected group to handle deletions gracefully
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
    useEffect(() => {
        if (selectedGroupId && groups.length > 0) {
            const index = groups.findIndex(g => String(g._id) === String(selectedGroupId));
            if (index !== -1) setLastSelectedIndex(index);
        }
    }, [selectedGroupId, groups]);

    // Auto-navigate or close if the selected group is deleted
    useEffect(() => {
        if (!selectedGroupId || isLoading) return;
        const groupExists = groups.some(g => String(g._id) === String(selectedGroupId));
        if (!groupExists) {
            if (groups.length === 0) {
                setSelectedGroupId(null);
            } else {
                const nextIndex = Math.min(lastSelectedIndex, groups.length - 1);
                setSelectedGroupId(nextIndex >= 0 ? groups[nextIndex]._id : null);
            }
        }
    }, [groups, selectedGroupId, isLoading, lastSelectedIndex]);

    const handleMergeToGroup = useCallback(async (groupId: string) => {
        try {
            await mergeTeamsToGroup({ groupId, eventId });
        } catch (error) {
            console.error(error);
        }
    }, [eventId, mergeTeamsToGroup]);

    // 5. Consolidated API
    return {
        selectedGroupId,
        setSelectedGroupId,
        leaderboard,
        isLeaderboardLoading,
        
        // Results State (Spread from results hook)
        ...results,
        selectedPairing: results.selectedPairing as LeaguePairingType | null,
        setSelectedPairing: results.setSelectedPairing as (p: LeaguePairingType | null) => void,
        
        // Navigation State (Explicitly mapped from navigation hook)
        handleNextGroup: navigation.nextGroup,
        handlePreviousGroup: navigation.prevGroup,
        hasNextGroup: navigation.hasNextGroup,
        hasPreviousGroup: navigation.hasPreviousGroup,
        currentGroupIndex: navigation.currentGroupIndex,
        totalGroupsCount: navigation.totalGroupsCount,

        // Logic & Data
        currentGroup,
        effectiveTotalMatch,
        isGroupCompleted,
        roundMatches,
        qualifyingTeams,
        showMerge,
        
        // Mutations
        handleMergeToGroup,
        isMergingToGroup,
    };
};
