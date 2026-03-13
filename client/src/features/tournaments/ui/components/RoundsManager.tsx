import { Trophy, Loader2, PanelTopClose, PanelTopOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { CreateRoundDialog } from "./dialogs/CreateRoundDialog";
import { useRoundsSidebar, useRoundActions } from "../../hooks";
import { ResetRoundDialog } from "./dialogs/ResetRoundDialog";
import { EditRoundDialog } from "./dialogs/EditRoundDialog";
import { RoundHeader } from "./rounds/RoundHeader";
import { RoundItem } from "./rounds/RoundItem";
import { RoundsSidebarHeader } from "./rounds/RoundsSidebarHeader";
import { GroupsGrid } from "./GroupsGrid";
import { RoadmapTabs } from "./RoadmapTabs";

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
        cooldown,
        handleRefresh,
        handleCreateGroups,
        handleManualCreateGroup,
        handleCompleteRound,
        isCreatingGroups,
        isCreatingSingleGroup
    } = useRoundActions(eventId, rounds, activeRoundTab);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="px-6 py-2 border-b border-white/5 bg-black/5 flex items-center justify-between">
                <RoadmapTabs
                    activeTab={activeRoundTab}
                    onTabChange={setActiveRoundTab}
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
                {/* Sidebar: Rounds List */}
                <div
                    className={`${isSidebarCollapsed ? "w-20" : "w-80 md:w-96"
                        } border-r border-white/5 bg-black/10 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col`}
                >
                    <RoundsSidebarHeader 
                        activeRoundTab={activeRoundTab}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleCollapse={setIsSidebarCollapsed}
                    />


                    <div className="space-y-2 px-4 pt-4 flex-1 overflow-y-auto custom-scrollbar">
                        {(isLoading || !event) && rounds.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                {isSidebarCollapsed ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Loading..."}
                            </div>
                        ) : filteredSidebarItems.map((round) => (
                            <RoundItem
                                key={round._id}
                                round={round}
                                activeRoundTab={activeRoundTab}
                                isSelected={selectedRoundId === round._id}
                                isSidebarCollapsed={isSidebarCollapsed}
                                onSelect={setSelectedRoundId}
                                onEditClick={(r) => {
                                    setActionRound(r);
                                    setIsEditRoundOpen(true);
                                }}
                                onDeleteClick={(r) => {
                                    setActionRound(r);
                                    setIsResetRoundOpen(true);
                                }}
                            />
                        ))}
                        {!isLoading && event && filteredSidebarItems.length === 0 && (
                            <div className="text-sm text-gray-500 text-center py-8">
                                {isSidebarCollapsed ? "Empty" : `No ${activeRoundTab === 'invited-tournament' ? 'invited' : 'main'} rounds found.`}
                            </div>
                        )}
                    </div>
                </div>

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
                                cooldown={cooldown}
                                isCreateDisabled={isCreateDisabled}
                                onComplete={() => handleCompleteRound(selectedRound)}
                                onStart={() => {
                                    setActionRound(selectedRound);
                                    setIsCreateRoundOpen(true);
                                }}
                                onCreateGroup={() => setIsConfirmManualGroupOpen(true)}
                                onRefresh={() => handleRefresh([refetchRounds, refetchEvent], selectedRoundId || undefined)}
                                onCreateGroups={() => setIsConfirmGroupsOpen(true)}
                            />

                            {/* Scrollable Groups Grid Area */}
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                {!selectedRound.isPlaceholder ? (
                                    <GroupsGrid roundId={selectedRound._id} eventId={eventId} />
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
            <CreateRoundDialog
                open={isCreateRoundOpen}
                onOpenChange={setIsCreateRoundOpen}
                eventId={eventId}
                type={activeRoundTab}
                roadmapIndex={actionRound?.roadmapIndex}
                initialName={actionRound?.roundName}
            />
            {actionRound && !actionRound.isPlaceholder && (
                <>
                    <EditRoundDialog
                        open={isEditRoundOpen}
                        onOpenChange={setIsEditRoundOpen}
                        roundId={actionRound._id}
                        eventId={eventId}
                        initialName={actionRound.roundName}
                    />
                    <ResetRoundDialog
                        open={isResetRoundOpen}
                        onOpenChange={setIsResetRoundOpen}
                        roundId={actionRound._id}
                        eventId={eventId}
                        roundName={actionRound.roundName}
                        onReset={() => {
                            setSelectedRoundId(actionRound._id);
                            setActionRound(null);
                        }}
                    />
                </>
            )}

            <ConfirmActionDialog
                open={isConfirmGroupsOpen}
                onOpenChange={setIsConfirmGroupsOpen}
                title="Generate Groups?"
                description={
                    <div className="space-y-4">
                        <p>This will automatically generate groups for <strong className="text-white">{selectedRound?.roundName}</strong> based on the available team data.</p>
                        {teamPreview && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 flex items-center justify-between">
                                <span className="text-gray-400 text-sm font-medium">{teamPreview.label}</span>
                                <span className="text-purple-400 font-black text-xl">{teamPreview.count} Teams</span>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 italic">Are you sure you want to proceed?</p>
                    </div>
                }
                actionLabel="Generate"
                onConfirm={async () => {
                    if (selectedRound) await handleCreateGroups(selectedRound._id);
                    setIsConfirmGroupsOpen(false);
                }}
                isLoading={isCreatingGroups}
                variant="default"
            />

            <ConfirmActionDialog
                open={isConfirmManualGroupOpen}
                onOpenChange={setIsConfirmManualGroupOpen}
                title="Create One New Group?"
                description={
                    <div className="space-y-4">
                        <p>Are you sure you want to create <strong className="text-white">one new group</strong> manually in <strong className="text-white">{selectedRound?.roundName}</strong>?</p>
                        {teamPreview && (
                            <div className="bg-purple-500/5 border border-white/5 rounded-lg p-3 flex items-center justify-between opacity-80">
                                <span className="text-gray-500 text-sm font-medium">{teamPreview.label} (Total Available)</span>
                                <span className="text-white font-black text-lg">{teamPreview.count} Teams</span>
                            </div>
                        )}
                    </div>
                }
                actionLabel="Create Group"
                onConfirm={async () => {
                    if (selectedRound) await handleManualCreateGroup(selectedRound._id);
                    setIsConfirmManualGroupOpen(false);
                }}
                isLoading={isCreatingSingleGroup}
                variant="default"
            />
        </div>
    );
};
