import { useState, useMemo, useEffect } from 'react';
import { useGetRoundsQuery, useGetTournamentDetailsQuery } from './useTournamentQueries';

export const useRoundsSidebar = (eventId: string) => {
    const { data: rounds = [], isLoading, refetch: refetchRounds } = useGetRoundsQuery(eventId);
    const { data: event, refetch: refetchEvent } = useGetTournamentDetailsQuery(eventId);

    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeRoundTab, setActiveRoundTab] = useState<"tournament" | "invited-tournament" | "t1-special">("tournament");

    // Unified list of rounds and roadmap placeholders
    const filteredSidebarItems = useMemo(() => {
        const typeInRounds = activeRoundTab;
        const roadmapType = activeRoundTab === 'invited-tournament' ? 'invitedTeams' : activeRoundTab;

        const actualRounds = rounds.filter(r => (r.type || "tournament") === typeInRounds);

        if (!event?.roadmaps) return actualRounds;

        const roadmap = event.roadmaps.find((r: any) => r.type === roadmapType);
        if (!roadmap || !roadmap.data) return actualRounds;

        return (roadmap.data || []).map((item: any, index: number) => {
            const linkedRound = actualRounds.find(r =>
                (item.roundId && r._id === item.roundId) ||
                (!item.roundId && r.roundName === item.title)
            );

            const isFirst = index === 0;
            const prevItem = index > 0 ? (roadmap.data[index - 1]) : null;
            const prevRound = index > 0 ? actualRounds.find(r =>
                (prevItem?.roundId && r._id === prevItem.roundId) ||
                (!prevItem?.roundId && r.roundName === prevItem?.title)
            ) : null;

            const isPlaceholder = !linkedRound;
            const isDisabled = isPlaceholder && (!isFirst && (!prevRound || prevRound.status !== 'completed'));

            // Calculate Merge Info
            let mergeInfo = null;
            if (activeRoundTab === 'invited-tournament' && (event.invitedRoundMappings?.length || 0) > 0) {
                // Check if this invited round merges into a main round
                const mapping = event.invitedRoundMappings?.find((m: any) => m.endRound === index + 1);
                if (mapping) {
                    const tournamentRoadmap = event.roadmaps?.find((r: any) => r.type === 'tournament');
                    const targetRound = tournamentRoadmap?.data?.[mapping.targetMainRound - 1];
                    mergeInfo = {
                        type: 'merges-into',
                        targetLabel: `Round ${mapping.targetMainRound}`,
                        targetTitle: targetRound?.title || "",
                        targetIndex: mapping.targetMainRound
                    };
                }
            } else if (activeRoundTab === 't1-special' && (event.t1SpecialRoundMappings?.length || 0) > 0) {
                // Check if this T1 special round merges into a main round
                const mapping = event.t1SpecialRoundMappings?.find((m: any) => m.endRound === index + 1);
                if (mapping) {
                    const tournamentRoadmap = event.roadmaps?.find((r: any) => r.type === 'tournament');
                    const targetRound = tournamentRoadmap?.data?.[mapping.targetMainRound - 1];
                    mergeInfo = {
                        type: 'merges-into',
                        targetLabel: `Round ${mapping.targetMainRound}`,
                        targetTitle: targetRound?.title || "",
                        targetIndex: mapping.targetMainRound
                    };
                }
            } else if (activeRoundTab === 'tournament') {
                // Check if this main round receives teams from invited or t1-special rounds
                if (linkedRound && linkedRound.mergeInfo) {
                    mergeInfo = {
                        ...linkedRound.mergeInfo,
                        type: 'receives-from'
                    };
                } else {
                    const invMappings = (event.invitedRoundMappings || []).filter((m: any) => m.targetMainRound === index + 1);
                    const t1Mappings = (event.t1SpecialRoundMappings || []).filter((m: any) => m.targetMainRound === index + 1);
                    
                    if (invMappings.length > 0 || t1Mappings.length > 0) {
                        const invitedRoadmap = event.roadmaps?.find((r: any) => r.type === 'invitedTeams');
                        const t1Roadmap = event.roadmaps?.find((r: any) => r.type === 't1-special');
                        
                        const sources = [
                            ...invMappings.map((m: any) => ({
                                type: 'invited',
                                name: invitedRoadmap?.data?.[m.endRound - 1]?.title || `Invited Round ${m.endRound}`
                            })),
                            ...t1Mappings.map((m: any) => ({
                                type: 't1-special',
                                name: t1Roadmap?.data?.[m.endRound - 1]?.title || `T1 Round ${m.endRound}`
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
                return { ...linkedRound, roadmapIndex: index, roadmapData: item, isDisabled, mergeInfo };
            }
            return {
                _id: `placeholder-${index}`,
                roundName: item.title,
                roundNumber: index + 1,
                status: 'pending',
                groups: [],
                isPlaceholder: true,
                roadmapIndex: index,
                type: typeInRounds,
                roadmapData: item,
                isDisabled,
                mergeInfo
            };
        });
    }, [rounds, event, activeRoundTab]);

    // Reset selection when tab changes to avoid stale data from previous tab
    useEffect(() => {
        if (filteredSidebarItems.length > 0) {
            // Either select the ongoing round or the first round in the current tab
            const active = filteredSidebarItems.find(item => item.status === 'ongoing') || filteredSidebarItems[0];
            setSelectedRoundId(active._id);
        } else {
            setSelectedRoundId(null);
        }
    }, [activeRoundTab]); // Only depend on activeRoundTab to reset when switching tabs

    // Derive selected round
    const selectedRound = useMemo(() => {
        if (!selectedRoundId) return null;
        return filteredSidebarItems.find(item => item._id === selectedRoundId) || null;
    }, [filteredSidebarItems, selectedRoundId]);

    // Auto-select logic
    useEffect(() => {
        if (filteredSidebarItems.length > 0 && !selectedRoundId) {
            const active = filteredSidebarItems.find(item => item.status === 'ongoing') || filteredSidebarItems[0];
            setSelectedRoundId(active._id);
        }
    }, [filteredSidebarItems, selectedRoundId]);

    // Team preview for generation dialogs
    const teamPreview = useMemo(() => {
        if (!selectedRound || !event) return null;

        const currentIndex = filteredSidebarItems.findIndex(item => item._id === selectedRound._id);
        const prevRound = currentIndex > 0 ? filteredSidebarItems[currentIndex - 1] : null;

        // Calculate teams that qualify strictly from the PREVIOUS MAIN ROUND
        let mainCount = 0;
        if (currentIndex === 0) {
            mainCount = (selectedRound as any).eligibleTeams?.length || 0;
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
        setIsSidebarCollapsed,
        activeRoundTab,
        setActiveRoundTab,
        filteredSidebarItems,
        teamPreview,
        isCreateDisabled
    };
};
