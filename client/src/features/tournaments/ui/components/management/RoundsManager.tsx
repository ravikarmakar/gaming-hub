import { Trophy, PanelTopClose, PanelTopOpen } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useRoundsSidebar, useRoundActions } from "@/features/tournaments/hooks";
import { RoundHeader } from "./rounds/RoundHeader";
import { GroupsGrid } from "./GroupsGrid";
import { RoadmapTabs } from "../details/RoadmapTabs";
import { RoundsSidebar } from "./RoundsSidebar";
import { RoundsManagerDialogs } from "./RoundsManagerDialogs";

interface RoundsManagerProps {
    eventId: string;
    isFocusMode?: boolean;
    onToggleFocus?: () => void;
}

export const RoundsManager = ({ eventId, isFocusMode, onToggleFocus }: RoundsManagerProps) => {
    // 1. Manage Sidebar & Data
    const {
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
    } = useRoundsSidebar(eventId);

    // Filter state lifted here so RoundHeader and GroupsGrid can share it
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("matchTime-asc");

    // Reset filters whenever user switches rounds
    useEffect(() => {
        setSearch("");
        setStatusFilter("");
        setSortBy("matchTime-asc");
    }, [selectedRoundId]);

    // 2. Manage Actions & Dialogs
    const {
        isCreateRoundOpen,
        setIsCreateRoundOpen,
        isEditRoundOpen,
        setIsEditRoundOpen,
        isResetRoundOpen,
        setIsResetRoundOpen,
        actionRound,
        setActionRound,
        isSavingStatus,
        isConfirmGroupsOpen,
        setIsConfirmGroupsOpen,
        isConfirmManualGroupOpen,
        setIsConfirmManualGroupOpen,
        isConfirmMergeOpen,
        setIsConfirmMergeOpen,
        cooldown,
        handleRefresh,
        handleCreateGroups,
        handleManualCreateGroup,
        handleCompleteRound,
        handleMergeTeams,
        isCreatingGroups,
        isCreatingSingleGroup,
        isMergingTeams
    } = useRoundActions(eventId);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="py-2 border-b border-white/5 bg-black/5 flex items-center justify-between">
                <RoadmapTabs
                    activeTab={activeRoundTab}
                    onTabChange={setActiveRoundTab}
                    showInvited={event?.hasInvitedTeams}
                    showT1Special={event?.hasT1SpecialTeams}
                />

                {onToggleFocus && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleFocus}
                        className={`h-8 w-8 p-0 transition-all duration-300 ${isFocusMode ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        {isFocusMode ? <PanelTopOpen className="w-4 h-4" /> : <PanelTopClose className="w-4 h-4" />}
                    </Button>
                )}
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <RoundsSidebar
                    isLoading={isLoading}
                    event={event}
                    rounds={rounds}
                    filteredSidebarItems={filteredSidebarItems}
                    selectedRoundId={selectedRoundId}
                    setSelectedRoundId={setSelectedRoundId}
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    activeRoundTab={activeRoundTab}
                    setActionRound={setActionRound}
                    setIsEditRoundOpen={setIsEditRoundOpen}
                    setIsResetRoundOpen={setIsResetRoundOpen}
                />

                {/* Main Content: Round Details */}
                <div className="flex-1 flex flex-col min-w-0 bg-black/5 overflow-hidden">
                    {selectedRound ? (
                        <>
                            {/* Sticky Round Header */}
                            <RoundHeader
                                round={selectedRound}
                                activeRoundTab={activeRoundTab}
                                isSavingStatus={isSavingStatus}
                                isCreatingSingleGroup={isCreatingSingleGroup}
                                isCreatingGroups={isCreatingGroups}
                                isMergingTeams={isMergingTeams}
                                cooldown={cooldown}
                                isCreateDisabled={isCreateDisabled}
                                onComplete={() => handleCompleteRound(selectedRound)}
                                onStart={() => {
                                    setActionRound(selectedRound);
                                    setIsCreateRoundOpen(true);
                                }}
                                onMergeTeams={() => setIsConfirmMergeOpen(true)}
                                onCreateGroup={() => {
                                    setSearch("");
                                    setStatusFilter("");
                                    setIsConfirmManualGroupOpen(true);
                                }}
                                onRefresh={() => handleRefresh([refetchRounds, refetchEvent], selectedRoundId || undefined)}
                                onCreateGroups={() => setIsConfirmGroupsOpen(true)}
                                search={search}
                                setSearch={setSearch}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                onResetFilters={() => {
                                    setSearch("");
                                    setStatusFilter("");
                                    setSortBy("matchTime-asc");
                                }}
                            />

                            {/* Scrollable Groups Grid Area */}
                            <div className="flex-1 py-2 overflow-y-auto custom-scrollbar">
                                {!selectedRound.isPlaceholder ? (
                                    <GroupsGrid
                                        roundId={selectedRound._id}
                                        eventId={eventId}
                                        search={search}
                                        statusFilter={statusFilter}
                                        sortBy={sortBy}
                                        onResetFilters={() => {
                                            setSearch("");
                                            setStatusFilter("");
                                            setSortBy("matchTime-asc");
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                        <Trophy className="w-12 h-12 text-gray-700 mb-4" />
                                        <p className="text-gray-400">This round hasn't started yet.</p>
                                        <p className="text-sm text-gray-500 mt-1">Complete the previous round to start this one from the roadmap.</p>
                                    </div>
                                )}
                            </div>
                        </>

                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                            Select a round to view details
                        </div>
                    )}
                </div>
            </div>

            <RoundsManagerDialogs
                eventId={eventId}
                activeRoundTab={activeRoundTab}
                actionRound={actionRound}
                setActionRound={setActionRound}
                isCreateRoundOpen={isCreateRoundOpen}
                setIsCreateRoundOpen={setIsCreateRoundOpen}
                isEditRoundOpen={isEditRoundOpen}
                setIsEditRoundOpen={setIsEditRoundOpen}
                isResetRoundOpen={isResetRoundOpen}
                setIsResetRoundOpen={setIsResetRoundOpen}
                isConfirmGroupsOpen={isConfirmGroupsOpen}
                setIsConfirmGroupsOpen={setIsConfirmGroupsOpen}
                isConfirmManualGroupOpen={isConfirmManualGroupOpen}
                setIsConfirmManualGroupOpen={setIsConfirmManualGroupOpen}
                isConfirmMergeOpen={isConfirmMergeOpen}
                setIsConfirmMergeOpen={setIsConfirmMergeOpen}
                selectedRound={selectedRound}
                setSelectedRoundId={setSelectedRoundId}
                teamPreview={teamPreview}
                isCreatingGroups={isCreatingGroups}
                isCreatingSingleGroup={isCreatingSingleGroup}
                isMergingTeams={isMergingTeams}
                handleCreateGroups={handleCreateGroups}
                handleManualCreateGroup={handleManualCreateGroup}
                handleMergeTeams={handleMergeTeams}
            />
        </div>
    );
};
