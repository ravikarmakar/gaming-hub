import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    useGetLeaderboardQuery,
    useUpdateGroupResultsMutation,
    useMergeTeamsToGroupMutation,
    useResetGroupMutation,
} from './';
import { Group } from '../types';

interface UseGroupsInteractionsProps {
    rounds: any[];
    groups: Group[];
    roundId: string;
    eventId: string;
    isLoading: boolean;
}

export const useGroupsInteractions = ({ rounds, groups, roundId, eventId, isLoading }: UseGroupsInteractionsProps) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetLeaderboardQuery(selectedGroupId ?? "");
    const { mutateAsync: updateGroupResults } = useUpdateGroupResultsMutation();
    const { mutateAsync: mergeTeamsToGroup, isPending: isMergingToGroup } = useMergeTeamsToGroupMutation();
    const { mutateAsync: resetGroup } = useResetGroupMutation();

    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [chatGroup, setChatGroup] = useState<Group | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [inviteGroup, setInviteGroup] = useState<Group | null>(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [mergeTeam, setMergeTeam] = useState<any>(null);
    const [isMergeOpen, setIsMergeOpen] = useState(false);

    const [isResultsMode, setIsResultsMode] = useState(false);
    const [tempResults, setTempResults] = useState<Record<string, { kills: number, rank: number }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    // For league groups: which sub-group pairing is active (AxB | BxC | AxC)
    const [selectedPairing, setSelectedPairing] = useState<'AxB' | 'BxC' | 'AxC' | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    // Derived State
    const { currentGroup, effectiveTotalMatch, isGroupCompleted, roundMatches, qualifyingTeams, showMerge } = useMemo(() => {
        const round = rounds.find(r => String(r._id) === String(roundId));
        const group = groups.find(g => String(g._id) === String(selectedGroupId));
        const rm = round?.matchesPerGroup;
        const qt = round?.qualifyingTeams || 0;

        const isLeague = round?.isLeague || group?.isLeague;
        const totalMatch = (group?.totalMatch && group.totalMatch > 0)
            ? group.totalMatch
            : (isLeague ? (rm ? rm * 3 : 18) : (rm || 1));

        // Show merge option if this round is a recipient in cross-track mappings
        const hasIncomingMappings = round?.mergeInfo?.type === 'receives-from';

        return {
            currentGroup: group,
            effectiveTotalMatch: totalMatch,
            isGroupCompleted: group?.status === 'completed',
            roundMatches: rm,
            qualifyingTeams: qt || group?.totalSelectedTeam || 0,
            showMerge: hasIncomingMappings
        };
    }, [rounds, groups, roundId, selectedGroupId]);


    const openEditModal = useCallback((group: Group) => {
        setTimeout(() => {
            setEditingGroup(group);
            setIsEditOpen(true);
        }, 0);
    }, []);

    const openChatModal = useCallback((group: Group) => {
        setTimeout(() => {
            setChatGroup(group);
            setIsChatOpen(true);
        }, 0);
    }, []);

    const openInviteModal = useCallback((group: Group) => {
        setTimeout(() => {
            setInviteGroup(group);
            setIsInviteOpen(true);
        }, 0);
    }, []);

    const openDeleteModal = useCallback((group: Group) => {
        setTimeout(() => {
            setDeletingGroup(group);
            setIsDeleteOpen(true);
        }, 0);
    }, []);

    const openMergeModal = useCallback((team: any) => {
        setTimeout(() => {
            setMergeTeam(team);
            setIsMergeOpen(true);
        }, 0);
    }, []);

    useEffect(() => {
        // 1. If NOT in results mode, keep tempResults empty to avoid leaking aggregate stats
        if (!isResultsMode) {
            if (Object.keys(tempResults).length > 0) {
                setTempResults({});
            }
            return;
        }

        // 2. If IN results mode AND tempResults is empty, initialize with 0s for a new match
        if (leaderboard?.teamScore && Object.keys(tempResults).length === 0) {
            const newResults: Record<string, { kills: number, rank: number }> = {};
            leaderboard.teamScore.forEach(t => {
                newResults[t.teamId._id] = {
                    kills: 0,
                    rank: 0
                };
            });
            setTempResults(newResults);
        }
        // If results mode is ON and tempResults is NOT empty, we don't overwrite
        // to preserve user input during background leaderboard refreshes.
    }, [leaderboard, isResultsMode]);

    const handleResultChange = useCallback((teamId: string, field: 'kills' | 'rank', value: number) => {
        setTempResults(prev => ({
            ...prev,
            [teamId]: {
                ...prev[teamId],
                [field]: value
            }
        }));
    }, []);

    const handleSubmitResults = () => {
        if (!selectedGroupId || !leaderboard || !currentGroup) return;
        setIsConfirmOpen(true);
    };
    
    const handleConfirmSubmit = async () => {
        if (!selectedGroupId || !currentGroup) return;

        const resultsArray = Object.entries(tempResults).map(([teamId, stats]) => ({
            teamId,
            kills: stats.kills || 0,
            rank: stats.rank || 0
        }));

        setIsSaving(true);
        setIsConfirmOpen(false);
        try {
            await updateGroupResults({
                groupId: selectedGroupId,
                eventId,
                results: resultsArray,
                // Pass pairing type for league groups (AxB / BxC / AxC)
                pairingType: selectedPairing ?? undefined,
            });
            setIsSaving(false);
            setIsResultsMode(false);
            setSelectedPairing(null);
            setTempResults({});
        } catch (error) {
            console.error(error);
            setIsSaving(false);
        }
    };
    
    const handleResetGroup = useCallback(() => {
        setIsResetConfirmOpen(true);
    }, []);

    const handleConfirmReset = async () => {
        if (!selectedGroupId) return;
        setIsSaving(true);
        setIsResetConfirmOpen(false);
        try {
            await resetGroup({ groupId: selectedGroupId, eventId });
            setIsSaving(false);
            setIsResultsMode(false);
            setSelectedPairing(null);
        } catch (error) {
            console.error(error);
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (selectedGroupId) {
            setIsResultsMode(false);
        }
    }, [selectedGroupId]);

    // Reset selection when round changes
    useEffect(() => {
        setSelectedGroupId(null);
        setIsResultsMode(false);
    }, [roundId]);

    // Track the index of the selected group to handle deletions gracefully
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

    useEffect(() => {
        if (selectedGroupId && groups.length > 0) {
            const index = groups.findIndex(g => String(g._id) === String(selectedGroupId));
            if (index !== -1) {
                setLastSelectedIndex(index);
            }
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
                // Try to select the group at the same index, or the last one if we were at the end
                const nextIndex = Math.min(lastSelectedIndex, groups.length - 1);
                if (nextIndex >= 0) {
                    setSelectedGroupId(groups[nextIndex]._id);
                } else {
                    setSelectedGroupId(null);
                }
            }
        }
    }, [groups, selectedGroupId, isLoading, lastSelectedIndex]);

    // Cleanup effects: Reset state when modals close to prevent stale data or UI freezes
    useEffect(() => {
        if (!isEditOpen) setEditingGroup(null);
    }, [isEditOpen]);

    useEffect(() => {
        if (!isChatOpen) setChatGroup(null);
    }, [isChatOpen]);

    useEffect(() => {
        if (!isInviteOpen) setInviteGroup(null);
    }, [isInviteOpen]);

    useEffect(() => {
        if (!isDeleteOpen) setDeletingGroup(null);
    }, [isDeleteOpen]);

    useEffect(() => {
        if (!isMergeOpen) setMergeTeam(null);
    }, [isMergeOpen]);

    const handleMergeToGroup = useCallback(async (groupId: string) => {
        try {
            await mergeTeamsToGroup({ groupId, eventId });
        } catch (error) {
            console.error(error);
        }
    }, [eventId, mergeTeamsToGroup]);

    const handleNextGroup = useCallback(() => {
        if (!selectedGroupId || groups.length === 0) return;
        const currentIndex = groups.findIndex(g => String(g._id) === String(selectedGroupId));
        if (currentIndex !== -1 && currentIndex < groups.length - 1) {
            setSelectedGroupId(groups[currentIndex + 1]._id);
        }
    }, [selectedGroupId, groups]);

    const handlePreviousGroup = useCallback(() => {
        if (!selectedGroupId || groups.length === 0) return;
        const currentIndex = groups.findIndex(g => String(g._id) === String(selectedGroupId));
        if (currentIndex > 0) {
            setSelectedGroupId(groups[currentIndex - 1]._id);
        }
    }, [selectedGroupId, groups]);

    const hasNextGroup = useMemo(() => {
        if (!selectedGroupId || groups.length === 0) return false;
        const currentIndex = groups.findIndex(g => String(g._id) === String(selectedGroupId));
        return currentIndex !== -1 && currentIndex < groups.length - 1;
    }, [selectedGroupId, groups]);

    const hasPreviousGroup = useMemo(() => {
        if (!selectedGroupId || groups.length === 0) return false;
        const currentIndex = groups.findIndex(g => String(g._id) === String(selectedGroupId));
        return currentIndex > 0;
    }, [selectedGroupId, groups]);

    const { currentGroupIndex, totalGroupsCount } = useMemo(() => {
        if (!selectedGroupId || groups.length === 0) return { currentGroupIndex: 0, totalGroupsCount: 0 };
        return {
            currentGroupIndex: groups.findIndex(g => String(g._id) === String(selectedGroupId)) + 1,
            totalGroupsCount: groups.length
        };
    }, [selectedGroupId, groups]);

    return {
        selectedGroupId,
        setSelectedGroupId,
        leaderboard,
        isLeaderboardLoading,
        editingGroup,
        isEditOpen,
        setIsEditOpen,
        chatGroup,
        isChatOpen,
        setIsChatOpen,
        inviteGroup,
        isInviteOpen,
        setIsInviteOpen,
        deletingGroup,
        isDeleteOpen,
        setIsDeleteOpen,
        mergeTeam,
        isMergeOpen,
        setIsMergeOpen,
        isResultsMode,
        setIsResultsMode,
        tempResults,
        isSaving,
        isConfirmOpen,
        setIsConfirmOpen,
        isResetConfirmOpen,
        setIsResetConfirmOpen,
        currentGroup,
        effectiveTotalMatch,
        isGroupCompleted,
        roundMatches,
        qualifyingTeams,
        openEditModal,
        openChatModal,
        openInviteModal,
        openDeleteModal,
        openMergeModal,
        handleResultChange,
        handleSubmitResults,
        handleConfirmSubmit,
        handleResetGroup,
        handleConfirmReset,
        handleMergeToGroup,
        isMergingToGroup,
        selectedPairing,
        setSelectedPairing,
        handleNextGroup,
        handlePreviousGroup,
        hasNextGroup,
        hasPreviousGroup,
        currentGroupIndex,
        totalGroupsCount,
        showMerge
    };
};

