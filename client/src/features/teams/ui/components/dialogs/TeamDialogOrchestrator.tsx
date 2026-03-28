import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import {
    useRemoveMemberMutation,
    useManageStaffMutation,
    useTransferOwnershipMutation,
    useDeleteTeamMutation,
    useLeaveTeamMutation,
    useClearAllJoinRequestsMutation,
    useInviteMemberMutation,
    useHandleJoinRequestMutation
} from '@/features/teams/hooks/useTeamMutations';

import { TeamConfirmationDialogs } from './TeamConfirmationDialogs';
import CreateTeamDialog from './CreateTeamDialog';
import { UpdateMemberRoleDialog } from './UpdateMemberRoleDialog';
import { PlayerSearchCommand } from "@/features/player/ui/components/PlayerSearchCommand";
import { useTeamDialogs } from '@/features/teams/context/TeamDialogContext';

export const TeamDialogOrchestrator = () => {
    const { activeDialog, dialogData, closeDialog } = useTeamDialogs();
    const navigate = useNavigate();

    // Mutations
    const removeMemberMutation = useRemoveMemberMutation();
    const manageStaffMutation = useManageStaffMutation();
    const transferOwnershipMutation = useTransferOwnershipMutation();
    const deleteTeamMutation = useDeleteTeamMutation();
    const leaveTeamMutation = useLeaveTeamMutation();
    const clearJoinRequestsMutation = useClearAllJoinRequestsMutation();
    const inviteMemberMutation = useInviteMemberMutation();
    const handleJoinRequestMutation = useHandleJoinRequestMutation();

    const handleConfirmAction = async (type: string, data: any): Promise<void> => {
        const teamId = data?.teamId || "";
        const memberId = data?.memberId || data?.user || "";

        try {
            switch (type) {
                case 'removeMember':
                    if (!teamId || !memberId) {
                        toast.error("Missing required IDs for this action");
                        return;
                    }
                    await removeMemberMutation.mutateAsync({ teamId, memberId });
                    break;
                case 'promoteMember':
                    if (!teamId || !memberId) {
                        toast.error("Missing required IDs for this action");
                        return;
                    }
                    await manageStaffMutation.mutateAsync({ teamId, memberId, action: 'promote' });
                    break;
                case 'demoteMember':
                    if (!teamId || !memberId) {
                        toast.error("Missing required IDs for this action");
                        return;
                    }
                    await manageStaffMutation.mutateAsync({ teamId, memberId, action: 'demote' });
                    break;
                case 'transferOwnership':
                    if (!teamId || !memberId) {
                        toast.error("Missing required IDs for this action");
                        return;
                    }
                    await transferOwnershipMutation.mutateAsync({ teamId, memberId });
                    break;
                case 'disbandTeam':
                    if (!teamId) {
                        toast.error("Team ID is required to disband");
                        return;
                    }
                    await deleteTeamMutation.mutateAsync(teamId);
                    closeDialog();
                    navigate("/");
                    return;
                case 'inviteMember':
                    if (!teamId || !data?.playerId) {
                        toast.error("Missing player ID for invitation");
                        return;
                    }
                    await inviteMemberMutation.mutateAsync({ teamId, playerId: data.playerId });
                    break;
                case 'leaveTeam':
                    if (!teamId) {
                        toast.error("Team ID is required to leave");
                        return;
                    }
                    await leaveTeamMutation.mutateAsync(teamId);
                    closeDialog();
                    navigate("/");
                    return;
                case 'clearJoinRequests':
                    if (!teamId) {
                        toast.error("Team ID is required to clear requests");
                        return;
                    }
                    await clearJoinRequestsMutation.mutateAsync(teamId);
                    break;
                case 'rejectJoinRequest':
                    if (!teamId || !data?.requestId) {
                        toast.error("Missing required IDs to reject request");
                        return;
                    }
                    await handleJoinRequestMutation.mutateAsync({ teamId, requestId: data.requestId, action: 'rejected' });
                    break;
                default:
                    console.error(`Unhandled action type: ${type}`);
                    toast.error("An unexpected error occurred. Action not found.");
                    return;
            }
            toast.success("Action completed successfully");
            closeDialog();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Action failed. Please try again.");
            throw error;
        }
    };

    const isMutationPending =
        removeMemberMutation.isPending ||
        manageStaffMutation.isPending ||
        transferOwnershipMutation.isPending ||
        deleteTeamMutation.isPending ||
        leaveTeamMutation.isPending ||
        clearJoinRequestsMutation.isPending ||
        inviteMemberMutation.isPending ||
        handleJoinRequestMutation.isPending;

    return (
        <>
            {/* Action Dialogs */}
            <CreateTeamDialog />
            <UpdateMemberRoleDialog />

            {/* Confirmation Dialogs */}
            <TeamConfirmationDialogs
                isMutationPending={isMutationPending}
                onConfirm={handleConfirmAction}
            />

            {/* Specialized Dialogs */}
            {activeDialog === 'inviteMember' && (
                <PlayerSearchCommand
                    open={true}
                    onOpenChange={(open) => !open && closeDialog()}
                    onInvite={async (playerId) => {
                        try {
                            await handleConfirmAction('inviteMember', { ...dialogData, playerId });
                            return true;
                        } catch (e) {
                            return false;
                        }
                    }}
                    isLoading={inviteMemberMutation.isPending}
                    existingMemberIds={dialogData?.existingMemberIds || []}
                />
            )}
        </>
    );
};
