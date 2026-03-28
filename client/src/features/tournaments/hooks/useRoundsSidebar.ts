import { useMemo, useEffect } from 'react';
import { useGetRoundsQuery } from './useTournamentQueries';
import { useTournamentRoadmap } from './useTournamentRoadmap';
import { useTournamentDashboard } from '../context/TournamentDashboardContext';

export const useRoundsSidebar = (eventId: string) => {
    const { 
        selectedRoundId, 
        setSelectedRoundId, 
        activeRoundTab,
        activeTab,
        eventDetails: event,
        refetch: refetchEvent,
        isSidebarCollapsed,
        setIsSidebarCollapsed
    } = useTournamentDashboard();

    const isRoundsNeeded = activeTab !== 'overview' && activeTab !== 'overview-v2' && activeTab !== 'settings' && activeTab !== 'teams';

    const { data: rounds = [], isLoading, refetch: refetchRounds } = useGetRoundsQuery(eventId, {
        enabled: isRoundsNeeded
    });

    // Unified list of rounds and roadmap placeholders using shared hook
    const { roadmapItems } = useTournamentRoadmap(
        event,
        rounds,
        activeRoundTab === 'invited-tournament' ? 'invitedTeams' : activeRoundTab
    );

    const filteredSidebarItems = roadmapItems;

    // Reset selection ONLY when tab changes to avoid stale data from previous tab
    useEffect(() => {
        if (roadmapItems.length > 0) {
            // Check if current selection is still valid in new tab
            const stillValid = roadmapItems.find(item => item._id === selectedRoundId);
            if (!stillValid) {
                // If not valid, select the ongoing round or the first round in the current tab
                const active = roadmapItems.find(item => item.status === 'ongoing') || roadmapItems[0];
                setSelectedRoundId(active._id || null);
            }
        }
    }, [activeRoundTab, roadmapItems.length]); // Depend on tab change and roadmap availability

    // Derive selected round
    const selectedRound = useMemo(() => {
        if (!selectedRoundId) return null;
        return roadmapItems.find(item => item._id === selectedRoundId) || null;
    }, [roadmapItems, selectedRoundId]);

    // Auto-select logic for initial load if nothing selected
    useEffect(() => {
        if (roadmapItems.length > 0 && !selectedRoundId) {
            const active = roadmapItems.find(item => item.status === 'ongoing') || roadmapItems[0];
            setSelectedRoundId(active._id || null);
        }
    }, [roadmapItems, selectedRoundId]);

    // Team preview for generation dialogs
    const teamPreview = useMemo(() => {
        if (!selectedRound || !event) return null;

        const currentIndex = filteredSidebarItems.findIndex(item => item._id === selectedRound._id);
        const prevRound = currentIndex > 0 ? filteredSidebarItems[currentIndex - 1] : null;

        // Calculate teams that qualify strictly from the PREVIOUS MAIN ROUND
        let mainCount = 0;
        if (currentIndex === 0) {
            if (activeRoundTab === 'invited-tournament') {
                mainCount = event.invitedTeams?.length || 0;
            } else if (activeRoundTab === 't1-special') {
                mainCount = event.t1SpecialTeams?.length || 0;
            } else {
                mainCount = event.registeredTeams?.length || 0;
            }
        } else if (prevRound) {
            mainCount = (prevRound.groups || []).reduce((acc: number, g: any) => acc + (g.totalSelectedTeam || 0), 0);
        }
        
        const mainLabel = currentIndex === 0 
            ? (activeRoundTab === 'invited-tournament' ? "Invited Teams" : activeRoundTab === 't1-special' ? "T1 Special Teams" : "Registered Teams")
            : `Qualified from ${prevRound?.roundName || `Round ${currentIndex}`}`;

        const sources = (selectedRound.mergeInfo as any)?.sources || [];
        const invitedCount = sources.reduce((acc: number, s: any) => acc + (s.mergedCount || 0) + (s.pendingCount || 0), 0);
        
        const totalCount = mainCount + invitedCount;
        
        // A round is "ready" to merge if ALL sources that have teams to contribute are completed.
        const pendingSources = sources.filter((s: any) => s.hasTeamsToMerge);
        const unreadySources = pendingSources.filter((s: any) => !s.isReady).map((s: any) => s.name);
        const isReady = unreadySources.length === 0;
        
        const hasPending = sources.some((s: any) => s.hasTeamsToMerge);
        
        return {
            label: mainLabel,
            count: mainCount,
            mainCount,
            invitedCount,
            totalCount,
            isReady,
            unreadySources,
            hasPending,
            currentRoundName: selectedRound.roundName,
            sources
        };
    }, [selectedRound, event, filteredSidebarItems, activeRoundTab]);

    const isCreateDisabled = !!(selectedRound as any)?.isDisabled;

    return {
        rounds,
        event,
        isLoading,
        refetchRounds,
        refetchEvent,
        selectedRoundId,
        setSelectedRoundId,
        selectedRound,
        isSidebarCollapsed,
        setIsSidebarCollapsed, // Still returning for interface consistency
        activeRoundTab,
        filteredSidebarItems,
        teamPreview,
        isCreateDisabled
    };
};
