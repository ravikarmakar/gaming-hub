import { Loader2 } from "lucide-react";
import { useGroupsGrid } from "../../hooks";
import { GroupGridView } from "./groups/GroupGridView";
import { GroupDetailsView } from "./groups/GroupDetailsView";
import { GroupsGridDialogs } from "./groups/GroupsGridDialogs";

interface GroupsGridProps {
    roundId: string;
    eventId: string;
}

export const GroupsGrid = ({ roundId, eventId }: GroupsGridProps) => {
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
        handleResultChange,
        handleSubmitResults,
        handleConfirmSubmit,
        handlePageChange,
        handleMergeToGroup,
        rounds,
        selectedPairing,
        setSelectedPairing,
    } = useGroupsGrid({ roundId, eventId });

    const currentRound = rounds.find((r: any) => r._id === roundId);

    if (isLoading && groups.length === 0 && !selectedGroupId) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!isLoading && groups.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-500">
                No groups found. Create groups to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {selectedGroupId && leaderboard ? (
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
                currentGroup={currentGroup}
                effectiveTotalMatch={effectiveTotalMatch}
                handleConfirmSubmit={handleConfirmSubmit}
                isSaving={isSaving}
                isMergeOpen={isMergeOpen}
                setIsMergeOpen={setIsMergeOpen}
                mergeTeam={mergeTeam}
            />
        </div>
    );
};
