import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Tournament, RoundTabType } from '../types';
import { useGetTournamentDetailsQuery } from '../hooks';

interface TournamentDashboardContextType {
    eventId: string;
    eventDetails: Tournament | undefined;
    isLoading: boolean;
    isFocusMode: boolean;
    setIsFocusMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
    
    // Navigation & Filtration (Context-Based Steering)
    selectedRoundId: string | null;
    setSelectedRoundId: (id: string | null) => void;
    activeRoundTab: RoundTabType;
    setActiveRoundTab: (tab: RoundTabType) => void;
    
    search: string;
    setSearch: (s: string) => void;
    statusFilter: string;
    setStatusFilter: (s: string) => void;
    sortBy: string;
    setSortBy: (s: string) => void;
    onResetFilters: () => void;

    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;

    // Global navigation tab
    activeTab: string;
    setActiveTab: (tab: string) => void;
    refetch: () => void;
}

const TournamentDashboardContext = createContext<TournamentDashboardContextType | undefined>(undefined);

interface TournamentDashboardProviderProps {
    eventId: string;
    children: ReactNode;
    initialFocusMode?: boolean;
}

/**
 * TournamentDashboardProvider centralizes the core state for the tournament dashboard.
 * It provides the eventId, fetched eventDetails, and UI states like focus mode
 * to all nested components, eliminating deep prop-drilling.
 */
export const TournamentDashboardProvider: React.FC<TournamentDashboardProviderProps> = ({ 
    eventId, 
    children,
    initialFocusMode = false 
}) => {
    const { data: eventDetails, isLoading, refetch } = useGetTournamentDetailsQuery(eventId, {
        enabled: !!eventId
    });

    const [isFocusMode, setIsFocusMode] = useState(initialFocusMode);
    
    // Modernization: Centralized Steering State
    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
    const [activeRoundTab, setActiveRoundTab] = useState<RoundTabType>("tournament");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("matchTime-asc");

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const onResetFilters = () => {
        setSearch("");
        setStatusFilter("");
        setSortBy("matchTime-asc");
    };

    const value = useMemo(() => ({
        eventId,
        eventDetails,
        isLoading,
        isFocusMode,
        setIsFocusMode,
        selectedRoundId,
        setSelectedRoundId,
        activeRoundTab,
        setActiveRoundTab,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        onResetFilters,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        activeTab,
        setActiveTab,
        refetch
    }), [
        eventId, 
        eventDetails, 
        isLoading, 
        isFocusMode, 
        selectedRoundId, 
        activeRoundTab, 
        search, 
        statusFilter, 
        sortBy, 
        isSidebarCollapsed,
        activeTab,
        refetch
    ]);

    return (
        <TournamentDashboardContext.Provider value={value}>
            {children}
        </TournamentDashboardContext.Provider>
    );
};

/**
 * Hook to access the TournamentDashboard context.
 * Must be used within a TournamentDashboardProvider.
 */
export const useTournamentDashboard = () => {
    const context = useContext(TournamentDashboardContext);
    if (context === undefined) {
        throw new Error('useTournamentDashboard must be used within a TournamentDashboardProvider');
    }
    return context;
};
