import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    useGetLeaderboardQuery, 
    useUpdateGroupResultsMutation, 
    useMergeTeamsToGroupMutation,
    Group 
} from './';

interface UseGroupsInteractionsProps {
    rounds: any[];
    groups: Group[];
    roundId: string;
    eventId: string;
}

export const useGroupsInteractions = ({ rounds, groups, roundId, eventId }: UseGroupsInteractionsProps) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const { data: leaderboard } = useGetLeaderboardQuery(selectedGroupId ?? "");
    const { mutateAsync: updateGroupResults } = useUpdateGroupResultsMutation();
    const { mutateAsync: mergeTeamsToGroup, isPending: isMergingToGroup } = useMergeTeamsToGroupMutation();

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

    // Derived State
    const { currentGroup, effectiveTotalMatch, isGroupCompleted, roundMatches, qualifyingTeams } = useMemo(() => {
        const round = rounds.find(r => r._id === roundId);
        const group = groups.find(g => g._id === selectedGroupId);
        const rm = round?.matchesPerGroup;
        const qt = round?.qualifyingTeams || 0;
        
        const isLeague = round?.isLeague || group?.isLeague;
        const totalMatch = isLeague 
            ? (rm ? rm * 3 : group?.totalMatch || 18)
            : (rm || group?.totalMatch || 1);

        return {
            currentGroup: group,
            effectiveTotalMatch: totalMatch,
            isGroupCompleted: group?.status === 'completed',
            roundMatches: rm,
            qualifyingTeams: qt
        };
    }, [rounds, groups, roundId, selectedGroupId]);

    const openEditModal = useCallback((group: Group) => {
        setEditingGroup(group);
        setIsEditOpen(true);
    }, []);

    const openChatModal = useCallback((group: Group) => {
        setChatGroup(group);
        setIsChatOpen(true);
    }, []);

    const openInviteModal = useCallback((group: Group) => {
        setInviteGroup(group);
        setIsInviteOpen(true);
    }, []);

    const openDeleteModal = useCallback((group: Group) => {
        setDeletingGroup(group);
        setIsDeleteOpen(true);
    }, []);

    const openMergeModal = useCallback((team: any) => {
        setMergeTeam(team);
        setIsMergeOpen(true);
    }, []);

    useEffect(() => {
        // Only initialize tempResults if we have a leaderboard AND
        // (we just entered results mode OR we don't have results yet)
        if (leaderboard?.teamScore && (isResultsMode || Object.keys(tempResults).length === 0)) {
            const hasExistingData = Object.keys(tempResults).length > 0;
            
            // If we are already in results mode and have data, don't overwrite it
            // This prevents data loss when the leaderboard query re-fetches in the background
            if (isResultsMode && hasExistingData) return;

            const newResults: Record<string, { kills: number, rank: number }> = {};
            leaderboard.teamScore.forEach(t => {
                newResults[t.teamId._id] = {
                    kills: isResultsMode ? 0 : (t.kills || 0),
                    rank: isResultsMode ? 0 : (t.position || 0)
                };
            });
            setTempResults(newResults);
        }
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

    const handleMergeToGroup = useCallback(async (groupId: string) => {
        try {
            await mergeTeamsToGroup({ groupId, eventId });
        } catch (error) {
            console.error(error);
        }
    }, [eventId, mergeTeamsToGroup]);

    return {
        selectedGroupId,
        setSelectedGroupId,
        leaderboard,
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
        handleMergeToGroup,
        isMergingToGroup,
        selectedPairing,
        setSelectedPairing,
    };
};
