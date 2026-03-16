import { EditGroupDialog } from "./EditGroupDialog";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { GroupChatDialog } from "./GroupChatDialog";
import { AddTeamDialog } from "@/features/tournaments/ui/components/dialogs/AddTeamDialog";
import { SubmitResultsDialog } from "@/features/tournaments/ui/components/dialogs/SubmitResultsDialog";
import { MergeTeamToGroupDialog } from "./MergeTeamToGroupDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Group } from "@/features/tournaments/types";

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
    isResetConfirmOpen: boolean;
    setIsResetConfirmOpen: (open: boolean) => void;
    currentGroup: Group | undefined;
    effectiveTotalMatch: number;
    handleConfirmSubmit: () => void;
    handleConfirmReset: () => void;
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
    isResetConfirmOpen,
    setIsResetConfirmOpen,
    currentGroup,
    effectiveTotalMatch,
    handleConfirmSubmit,
    handleConfirmReset,
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

            <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Group Matches?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This will permanently delete all entered results for <span className="text-white font-bold">{currentGroup?.groupName}</span> and reset its status to pending. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmReset}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Reset Matches
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
