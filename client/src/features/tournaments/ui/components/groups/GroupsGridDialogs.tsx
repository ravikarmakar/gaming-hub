import { EditGroupDialog } from "./EditGroupDialog";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { GroupChatDialog } from "./GroupChatDialog";
import { AddTeamDialog } from "../dialogs/AddTeamDialog";
import { SubmitResultsDialog } from "../dialogs/SubmitResultsDialog";
import { MergeTeamToGroupDialog } from "./MergeTeamToGroupDialog";
import { Group } from "../../../hooks";

interface GroupsGridDialogsProps {
    eventId: string;
    roundId: string;
    activeRoundTab: string;
    isEditOpen: boolean;
    setIsEditOpen: (open: boolean) => void;
    editingGroup: Group | null;
    isDeleteOpen: boolean;
    setIsDeleteOpen: (open: boolean) => void;
    deletingGroup: Group | null;
    isChatOpen: boolean;
    setIsChatOpen: (open: boolean) => void;
    chatGroup: Group | null;
    isInviteOpen: boolean;
    setIsInviteOpen: (open: boolean) => void;
    inviteGroup: Group | null;
    isConfirmOpen: boolean;
    setIsConfirmOpen: (open: boolean) => void;
    currentGroup: Group | undefined;
    effectiveTotalMatch: number;
    handleConfirmSubmit: () => void;
    isSaving: boolean;
    isMergeOpen: boolean;
    setIsMergeOpen: (open: boolean) => void;
    mergeTeam: any;
}

export const GroupsGridDialogs = ({
    eventId,
    roundId,
    activeRoundTab,
    isEditOpen,
    setIsEditOpen,
    editingGroup,
    isDeleteOpen,
    setIsDeleteOpen,
    deletingGroup,
    isChatOpen,
    setIsChatOpen,
    chatGroup,
    isInviteOpen,
    setIsInviteOpen,
    inviteGroup,
    isConfirmOpen,
    setIsConfirmOpen,
    currentGroup,
    effectiveTotalMatch,
    handleConfirmSubmit,
    isSaving,
    isMergeOpen,
    setIsMergeOpen,
    mergeTeam
}: GroupsGridDialogsProps) => {
    return (
        <>
            <EditGroupDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                eventId={eventId}
                group={editingGroup}
            />

            <DeleteGroupDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                eventId={eventId}
                group={deletingGroup}
            />

            <GroupChatDialog
                open={isChatOpen}
                onOpenChange={setIsChatOpen}
                groupId={chatGroup?._id || null}
                groupName={chatGroup?.groupName || ""}
            />

            <AddTeamDialog
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                groupId={inviteGroup?._id || null}
                groupName={inviteGroup?.groupName || ""}
                eventId={eventId}
                isT1Special={activeRoundTab === 't1-special'}
            />

            <SubmitResultsDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                matchesPlayed={currentGroup?.matchesPlayed || 0}
                effectiveTotalMatch={effectiveTotalMatch}
                onConfirm={handleConfirmSubmit}
                isSaving={isSaving}
            />

            <MergeTeamToGroupDialog
                open={isMergeOpen}
                onOpenChange={setIsMergeOpen}
                eventId={eventId}
                team={mergeTeam}
                sourceRoundId={roundId}
            />
        </>
    );
};
