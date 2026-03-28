import React, { createContext, useContext, useMemo } from 'react';
import { useGroupsGrid } from '@/features/tournaments/hooks';
import { useTournamentDashboard } from './TournamentDashboardContext';
import { Group, Round, LeaguePairingType, Leaderboard } from '../types';

interface GroupsStateContextType {
    // Data & Loading
    groups: Group[];
    isLoading: boolean;
    isFetching: boolean;
    totalGroups: number;
    currentPage: number;
    totalPages: number;
    roundMatches: number | undefined;
    activeRoundTab: string;
    rounds: Round[];
    
    // Selection & Details
    selectedGroupId: string | null;
    currentGroup: Group | null;
    leaderboard: Leaderboard | null;
    isLeaderboardLoading: boolean;
    
    // Navigation State (Derived/Helper)
    hasNextGroup: boolean;
    hasPreviousGroup: boolean;
    currentGroupIndex: number;
    totalGroupsCount: number;
    
    // Results & Scoring State
    isResultsMode: boolean;
    tempResults: Record<string, { kills: number, rank: number }>;
    isSaving: boolean;
    selectedPairing: LeaguePairingType | null;
    
    // Logic/Derived
    effectiveTotalMatch: number;
    isGroupCompleted: boolean;
    qualifyingTeams: number;
    showMerge: boolean;
    
    // Shared IDs
    roundId: string;
    eventId: string;
}

interface GroupsActionsContextType {
    setSelectedGroupId: (id: string | null) => void;
    handlePageChange: (page: number) => void;
    handleNextGroup: () => void;
    handlePreviousGroup: () => void;
    setIsResultsMode: (mode: boolean) => void;
    handleResultChange: (teamId: string, field: 'kills' | 'rank', value: number) => void;
    handleSubmitResults: () => void;
    setSelectedPairing: (pairing: LeaguePairingType | null) => void;
    handleMergeToGroup: (groupId: string) => Promise<void>;
    handleResetGroup: (group: Group) => void;
}

const GroupsStateContext = createContext<GroupsStateContextType | undefined>(undefined);
const GroupsActionsContext = createContext<GroupsActionsContextType | undefined>(undefined);

export const TournamentGroupsProvider: React.FC<{ children: React.ReactNode }> = ({ 
    children 
}) => {
    const { eventId, selectedRoundId } = useTournamentDashboard();
    
    const groupsGrid = useGroupsGrid({ 
        roundId: selectedRoundId || "", 
        eventId 
    });

    const stateValue = useMemo(() => ({
        groups: groupsGrid.groups,
        isLoading: groupsGrid.isLoading,
        isFetching: groupsGrid.isFetching,
        totalGroups: groupsGrid.totalGroups,
        currentPage: groupsGrid.currentPage,
        totalPages: groupsGrid.totalPages,
        roundMatches: groupsGrid.roundMatches,
        activeRoundTab: groupsGrid.activeRoundTab,
        rounds: groupsGrid.rounds,
        selectedGroupId: groupsGrid.selectedGroupId,
        currentGroup: groupsGrid.currentGroup,
        leaderboard: groupsGrid.leaderboard,
        isLeaderboardLoading: groupsGrid.isLeaderboardLoading,
        hasNextGroup: groupsGrid.hasNextGroup,
        hasPreviousGroup: groupsGrid.hasPreviousGroup,
        currentGroupIndex: groupsGrid.currentGroupIndex,
        totalGroupsCount: groupsGrid.totalGroupsCount,
        isResultsMode: groupsGrid.isResultsMode,
        tempResults: groupsGrid.tempResults,
        isSaving: groupsGrid.isSaving,
        selectedPairing: groupsGrid.selectedPairing,
        effectiveTotalMatch: groupsGrid.effectiveTotalMatch,
        isGroupCompleted: groupsGrid.isGroupCompleted,
        qualifyingTeams: groupsGrid.qualifyingTeams,
        showMerge: groupsGrid.showMerge,
        roundId: selectedRoundId || "",
        eventId
    }), [groupsGrid, selectedRoundId, eventId]);

    const actionsValue = useMemo(() => ({
        setSelectedGroupId: groupsGrid.setSelectedGroupId,
        handlePageChange: groupsGrid.handlePageChange,
        handleNextGroup: groupsGrid.handleNextGroup,
        handlePreviousGroup: groupsGrid.handlePreviousGroup,
        setIsResultsMode: groupsGrid.setIsResultsMode,
        handleResultChange: groupsGrid.handleResultChange,
        handleSubmitResults: groupsGrid.handleSubmitResults,
        setSelectedPairing: groupsGrid.setSelectedPairing,
        handleMergeToGroup: groupsGrid.handleMergeToGroup,
        handleResetGroup: groupsGrid.handleResetGroup,
    }), [groupsGrid]);

    return (
        <GroupsStateContext.Provider value={stateValue}>
            <GroupsActionsContext.Provider value={actionsValue}>
                {children}
            </GroupsActionsContext.Provider>
        </GroupsStateContext.Provider>
    );
};

export const useGroupsContext = () => {
    const state = useContext(GroupsStateContext);
    const actions = useContext(GroupsActionsContext);
    
    if (state === undefined || actions === undefined) {
        throw new Error('useGroupsContext must be used within a TournamentGroupsProvider');
    }
    return useMemo(() => ({ ...state, ...actions }), [state, actions]);
};

export const useGroupsState = () => {
    const context = useContext(GroupsStateContext);
    if (context === undefined) {
        throw new Error('useGroupsState must be used within a TournamentGroupsProvider');
    }
    return context;
};

export const useGroupsActions = () => {
    const context = useContext(GroupsActionsContext);
    if (context === undefined) {
        throw new Error('useGroupsActions must be used within a TournamentGroupsProvider');
    }
    return context;
};
