import React from "react";
import { EditGroupDialog } from "./EditGroupDialog";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { GroupChatDialog } from "./GroupChatDialog";
import { MergeTeamToGroupDialog } from "./MergeTeamToGroupDialog";
import { SubmitResultsDialog } from "../../dialogs/SubmitResultsDialog";
import { AddTeamDialog } from "../../dialogs/AddTeamDialog";

import { useTournamentDialogs } from "@/features/tournaments/context/TournamentDialogContext";
import { useGroupsContext } from "@/features/tournaments/context/TournamentGroupsContext";

/**
 * A wrapper for all group-level management dialogs.
 * This helps keep the TournamentDialogOrchestrator clean.
 */
export const GroupsGridDialogs: React.FC = () => {
    const {
        isOpen,
        closeDialog,
        dialogData
    } = useTournamentDialogs();

    const {
        eventId,
        roundId,
        activeRoundTab,
        currentGroup,
        effectiveTotalMatch,
        handleSubmitResults,
        isSaving
    } = useGroupsContext();

    return (
        <>
            <EditGroupDialog
                open={isOpen('editGroup')}
                onOpenChange={(open) => !open && closeDialog()}
                eventId={eventId}
                group={isOpen('editGroup') ? dialogData : null}
            />

            <DeleteGroupDialog
                open={isOpen('deleteGroup')}
                onOpenChange={(open) => !open && closeDialog()}
                eventId={eventId}
                group={isOpen('deleteGroup') ? dialogData : null}
            />

            <GroupChatDialog
                open={isOpen('groupChat')}
                onOpenChange={(open) => !open && closeDialog()}
                groupId={isOpen('groupChat') ? dialogData?._id : null}
                groupName={isOpen('groupChat') ? dialogData?.groupName : ""}
            />

            <MergeTeamToGroupDialog
                open={isOpen('mergeTeamToGroup')}
                onOpenChange={(open) => !open && closeDialog()}
                eventId={eventId}
                team={isOpen('mergeTeamToGroup') ? dialogData : null}
                sourceRoundId={roundId}
            />

            <AddTeamDialog
                open={isOpen('addTeam')}
                onOpenChange={(open) => !open && closeDialog()}
                eventId={eventId}
                groupId={isOpen('addTeam') ? dialogData?._id : null}
                groupName={isOpen('addTeam') ? dialogData?.groupName : ""}
                isT1Special={activeRoundTab === "t1-special"}
            />

            <SubmitResultsDialog
                open={isOpen('submitResults')}
                onOpenChange={(open) => !open && closeDialog()}
                matchesPlayed={currentGroup?.matchesPlayed || 0}
                effectiveTotalMatch={effectiveTotalMatch}
                onConfirm={() => handleSubmitResults()}
                isSaving={isSaving}
            />
        </>
    );
};
