import { Loader2, SearchX, RotateCcw } from "lucide-react";
import { useGroupsGrid } from "@/features/tournaments/hooks";
import { GroupGridView } from "./groups/GroupGridView";
import { GroupDetailsView } from "./groups/GroupDetailsView";
import { GroupsGridDialogs } from "./groups/GroupsGridDialogs";

interface GroupsGridProps {
    roundId: string;
    eventId: string;
    search?: string;
    statusFilter?: string;
    sortBy?: string;
    onResetFilters?: () => void;
}

export const GroupsGrid = ({
    roundId,
    eventId,
    search: externalSearch,
    statusFilter: externalStatusFilter,
    sortBy: externalSortBy,
    onResetFilters
}: GroupsGridProps) => {
    const {
        currentPage,
        activeRoundTab,
        groups,
        isLoading,
        totalPages,
        totalGroups,
        selectedGroupId,
        setSelectedGroupId,
        leaderboard,
        currentGroup,
        effectiveTotalMatch,
        isGroupCompleted,
        roundMatches,
        qualifyingTeams,
        isResultsMode,
        setIsResultsMode,
        tempResults,
        isSaving,
        isConfirmOpen,
        setIsConfirmOpen,
        isResetConfirmOpen,
        setIsResetConfirmOpen,
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
        openEditModal,
        openChatModal,
        openInviteModal,
        openDeleteModal,
        openMergeModal,
        handlePageChange,
        handleMergeToGroup,
        rounds,
        selectedPairing,
        setSelectedPairing,
        search,
        statusFilter,
        handleNextGroup,
        handlePreviousGroup,
        hasNextGroup,
        hasPreviousGroup,
        handleSubmitResults,
        handleResultChange,
        handleConfirmSubmit,
        handleResetGroup,
        handleConfirmReset,
        currentGroupIndex,
        totalGroupsCount,
        isLeaderboardLoading,
        isFetching,
    } = useGroupsGrid({ roundId, eventId, externalSearch, externalStatusFilter, externalSortBy });

    const currentRound = rounds.find((r: any) => r._id === roundId);



    if ((isLoading || isFetching) && groups.length === 0 && !selectedGroupId) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!isLoading && !isFetching && groups.length === 0) {
        if (search || statusFilter) {
            return (
                <div className="flex flex-col h-64 items-center justify-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <SearchX className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">No matches found</h3>
                        <p className="text-sm text-gray-400 max-w-xs mt-1">
                            We couldn't find any groups matching your current filters.
                        </p>
                    </div>
                    {onResetFilters && (
                        <button
                            onClick={onResetFilters}
                            className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Clear Filters
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col h-64 items-center justify-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 opacity-20" />
                </div>
                <p className="text-sm">No groups found. Create groups to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {selectedGroupId ? (
                <GroupDetailsView
                    currentGroup={currentGroup}
                    leaderboard={leaderboard}
                    setSelectedGroupId={setSelectedGroupId}
                    effectiveTotalMatch={effectiveTotalMatch}
                    isGroupCompleted={isGroupCompleted}
                    qualifyingTeams={qualifyingTeams}
                    isResultsMode={isResultsMode}
                    setIsResultsMode={setIsResultsMode}
                    handleSubmitResults={handleSubmitResults}
                    isSaving={isSaving}
                    openInviteModal={openInviteModal}
                    tempResults={tempResults}
                    handleResultChange={handleResultChange}
                    activeRoundTab={activeRoundTab}
                    openMergeModal={openMergeModal}
                    selectedPairing={selectedPairing}
                    setSelectedPairing={setSelectedPairing}
                    onNextGroup={handleNextGroup}
                    onPreviousGroup={handlePreviousGroup}
                    hasNextGroup={hasNextGroup}
                    hasPreviousGroup={hasPreviousGroup}
                    openEditModal={openEditModal}
                    openDeleteModal={openDeleteModal}
                    onResetGroup={handleResetGroup}
                    openChatModal={openChatModal}
                    currentGroupIndex={currentGroupIndex}
                    totalGroupsCount={totalGroupsCount}
                    isLoading={isLeaderboardLoading}

                />
            ) : (
                <GroupGridView
                    groups={groups}
                    roundMatches={roundMatches}
                    setSelectedGroupId={setSelectedGroupId}
                    openEditModal={openEditModal}
                    openDeleteModal={openDeleteModal}
                    openChatModal={openChatModal}
                    openInviteModal={openInviteModal}
                    totalGroups={totalGroups}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    isLoading={isLoading}
                    handlePageChange={handlePageChange}
                    onMergeToGroup={handleMergeToGroup}
                    activeRoundTab={activeRoundTab}
                    round={currentRound}
                    onResetGroup={handleResetGroup}
                />
            )}

            <GroupsGridDialogs
                eventId={eventId}
                roundId={roundId}
                activeRoundTab={activeRoundTab}
                isEditOpen={isEditOpen}
                setIsEditOpen={setIsEditOpen}
                editingGroup={editingGroup}
                isDeleteOpen={isDeleteOpen}
                setIsDeleteOpen={setIsDeleteOpen}
                deletingGroup={deletingGroup}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                chatGroup={chatGroup}
                isInviteOpen={isInviteOpen}
                setIsInviteOpen={setIsInviteOpen}
                inviteGroup={inviteGroup}
                isConfirmOpen={isConfirmOpen}
                setIsConfirmOpen={setIsConfirmOpen}
                isResetConfirmOpen={isResetConfirmOpen}
                setIsResetConfirmOpen={setIsResetConfirmOpen}
                currentGroup={currentGroup}
                effectiveTotalMatch={effectiveTotalMatch}
                handleConfirmSubmit={handleConfirmSubmit}
                handleConfirmReset={handleConfirmReset}
                isSaving={isSaving}
                isMergeOpen={isMergeOpen}
                setIsMergeOpen={setIsMergeOpen}
                mergeTeam={mergeTeam}
            />
        </div>
    );
};
