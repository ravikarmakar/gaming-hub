import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { Round, Tournament } from '../types';
import { useTournamentDashboard } from './TournamentDashboardContext';
import { useRoundsSidebar, useRoundActions } from '../hooks';

// Extended type for management-specific round properties
export interface TournamentRound extends Round {
    isPlaceholder?: boolean;
    roadmapData?: any;
    groups?: any[];
}

interface RoundsStateContextType {
    rounds: TournamentRound[];
    event: Tournament | undefined;
    isLoading: boolean;
    selectedRound: TournamentRound | null;
    filteredSidebarItems: TournamentRound[];
    isCreateDisabled: boolean;
    isSavingStatus: boolean;
    cooldown: number;
    eventId: string;
    teamPreview: any;
    activeRoundTab: string;
}

interface RoundsActionsContextType {
    refetchRounds: () => void;
    refetchEvent: () => void;
    handleRefresh: () => void;
    handleCompleteRound: (round: Round) => Promise<void>;
    handleCreateGroups: (roundId: string) => Promise<void>;
    handleManualCreateGroup: (roundId: string, groupType?: string, groupSize?: number) => Promise<void>;
    handleMergeTeams: (roundId: string) => Promise<void>;
}

const RoundsStateContext = createContext<RoundsStateContextType | undefined>(undefined);
const RoundsActionsContext = createContext<RoundsActionsContextType | undefined>(undefined);

export const TournamentRoundsProvider: React.FC<{ children: React.ReactNode }> = ({ 
    children 
}) => {
    const { eventId, selectedRoundId } = useTournamentDashboard();
    
    // 1. Manage Sidebar & Data logic
    const {
        rounds,
        event,
        isLoading,
        refetchRounds,
        refetchEvent,
        selectedRound,
        filteredSidebarItems,
        isCreateDisabled,
        teamPreview,
        activeRoundTab
    } = useRoundsSidebar(eventId);

    // 2. Manage Actions
    const {
        isSavingStatus,
        cooldown,
        handleRefresh: hookHandleRefresh,
        handleCompleteRound,
        handleCreateGroups,
        handleManualCreateGroup,
        handleMergeTeams,
    } = useRoundActions(eventId);

    const handleRefresh = useCallback(() => {
        hookHandleRefresh([refetchRounds, refetchEvent], selectedRoundId || undefined);
    }, [hookHandleRefresh, refetchRounds, refetchEvent, selectedRoundId]);

    const stateValue = useMemo(() => ({
        rounds: rounds as TournamentRound[],
        event,
        isLoading,
        selectedRound: selectedRound as TournamentRound | null,
        filteredSidebarItems: filteredSidebarItems as TournamentRound[],
        isCreateDisabled,
        isSavingStatus,
        cooldown,
        eventId,
        teamPreview,
        activeRoundTab
    }), [
        rounds,
        event,
        isLoading,
        selectedRound,
        filteredSidebarItems,
        isCreateDisabled,
        isSavingStatus,
        cooldown,
        eventId,
        teamPreview,
        activeRoundTab
    ]);

    const actionsValue = useMemo(() => ({
        refetchRounds,
        refetchEvent,
        handleRefresh,
        handleCompleteRound,
        handleCreateGroups,
        handleManualCreateGroup,
        handleMergeTeams
    }), [
        refetchRounds,
        refetchEvent,
        handleRefresh,
        handleCompleteRound,
        handleCreateGroups,
        handleManualCreateGroup,
        handleMergeTeams
    ]);

    return (
        <RoundsStateContext.Provider value={stateValue}>
            <RoundsActionsContext.Provider value={actionsValue}>
                {children}
            </RoundsActionsContext.Provider>
        </RoundsStateContext.Provider>
    );
};

export const useRoundsContext = () => {
    const state = useContext(RoundsStateContext);
    const actions = useContext(RoundsActionsContext);
    
    if (state === undefined || actions === undefined) {
        throw new Error('useRoundsContext must be used within a TournamentRoundsProvider');
    }
    
    // Return a combined object for backward compatibility, 
    // but components can now use specialized hooks if they want deeper optimization.
    return useMemo(() => ({ ...state, ...actions }), [state, actions]);
};

// Specialized hooks for optimization
export const useRoundsState = () => {
    const context = useContext(RoundsStateContext);
    if (context === undefined) {
        throw new Error('useRoundsState must be used within a TournamentRoundsProvider');
    }
    return context;
};

export const useRoundsActions = () => {
    const context = useContext(RoundsActionsContext);
    if (context === undefined) {
        throw new Error('useRoundsActions must be used within a TournamentRoundsProvider');
    }
    return context;
};
