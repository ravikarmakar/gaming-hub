import React from 'react';
import { ConfirmActionDialog, DialogVariant } from "@/components/shared/dialogs/ConfirmActionDialog";
import { useTeamDialogs } from "@/features/teams/context/TeamDialogContext";

interface TeamConfirmationDialogsProps {
    isMutationPending?: boolean;
    onConfirm: (type: string, data: any) => Promise<void>;
}

export const TeamConfirmationDialogs: React.FC<TeamConfirmationDialogsProps> = ({
    isMutationPending,
    onConfirm
}) => {
    const { activeDialog, dialogData, closeDialog } = useTeamDialogs();

    const getDialogConfig = () => {
        const config: { title: string; description: React.ReactNode; variant: DialogVariant; actionLabel: string } = {
            title: "",
            description: "",
            variant: "default",
            actionLabel: "Confirm"
        };

        if (activeDialog === "transferOwnership") {
            config.title = "Transfer Team Ownership?";
            config.variant = "warning";
            config.actionLabel = "Yes, Transfer Ownership";
            config.description = (
                <>
                    Are you sure you want to transfer ownership to <span className="text-white font-bold">{dialogData?.username}</span>?
                    You will lose your Owner privileges.
                </>
            );
        } else if (activeDialog === "promoteMember") {
            config.title = "Promote to Manager?";
            config.variant = "success";
            config.actionLabel = "Promote Member";
            config.description = (
                <>
                    Promoting <span className="text-white font-bold">{dialogData?.username}</span> will grant them Manager permissions, allowing them to invite/remove members and manage practice schedules.
                </>
            );
        } else if (activeDialog === "demoteMember") {
            config.title = "Demote to Player?";
            config.variant = "danger";
            config.actionLabel = "Demote Member";
            config.description = (
                <>
                    Demoting <span className="text-white font-bold">{dialogData?.username}</span> will revoke their Manager permissions. They will remain on the team as a player.
                </>
            );
        } else if (activeDialog === "removeMember") {
            config.title = "Remove Member?";
            config.variant = "danger";
            config.actionLabel = "Remove Member";
            config.description = (
                <>
                    Are you sure you want to remove <span className="text-white font-bold">{dialogData?.username}</span> from the team?
                    They will lose access to team features and chat.
                </>
            );
        } else if (activeDialog === "disbandTeam") {
            config.title = "Disband Team?";
            config.variant = "danger";
            config.actionLabel = "Yes, Disband Team";
            config.description = (
                <>
                    Are you sure you want to disband this team? This action is <span className="text-red-500 font-black uppercase">permanent</span> and cannot be undone.
                    All members will be removed and the team profile will be deleted forever.
                </>
            );
        } else if (activeDialog === "leaveTeam") {
            config.title = "Leave Team?";
            config.variant = "danger";
            config.actionLabel = "Leave Team";
            config.description = (
                <>
                    Are you sure you want to leave this team? This action cannot be undone. You'll need to be invited again to rejoin.
                </>
            );
        } else if (activeDialog === "clearJoinRequests") {
            config.title = "Clear All Requests?";
            config.variant = "danger";
            config.actionLabel = "Clear All";
            config.description = (
                <>
                    Are you sure you want to clear all pending join requests? This action cannot be undone.
                </>
            );
        } else if (activeDialog === "rejectJoinRequest") {
            config.title = "Confirm Application Rejection";
            config.variant = "danger";
            config.actionLabel = "Reject Application";
            config.description = (
                <>
                    Are you sure you want to reject this team application? This action cannot be undone.
                </>
            );
        }

        return config;
    };

    const config = getDialogConfig();
    const isConfirmationDialog = ["transferOwnership", "promoteMember", "demoteMember", "removeMember", "disbandTeam", "leaveTeam", "clearJoinRequests", "rejectJoinRequest"].includes(activeDialog || "");

    return (
        <ConfirmActionDialog
            open={isConfirmationDialog}
            onOpenChange={(open) => !open && closeDialog()}
            title={config.title}
            description={config.description}
            onConfirm={() => onConfirm(activeDialog!, dialogData)}
            isLoading={isMutationPending}
            variant={config.variant}
            actionLabel={config.actionLabel}
        />
    );
};
