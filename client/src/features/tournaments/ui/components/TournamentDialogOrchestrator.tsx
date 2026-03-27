import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ORGANIZER_ROUTES } from '@/features/organizer/lib/routes';
import { useTournamentDialogs } from '@/features/tournaments/context/TournamentDialogContext';
import { useTournamentDashboard } from '@/features/tournaments/context/TournamentDashboardContext';
import { useStartTournamentMutation, useDeleteTournamentMutation } from '@/features/tournaments/hooks';

// Dialog Components
import { RoundsManagerDialogs } from './management/RoundsManagerDialogs';
import { GroupsGridDialogs } from './management/groups/GroupsGridDialogs';
import { TournamentOperationsDialogs } from './tournaments/TournamentOperationsDialogs';

/**
 * TournamentDialogOrchestrator is rendered at the top level (within DialogProvider).
 * It connects the global dialog state to the actual dialog components and their specific hooks.
 */
export const TournamentDialogOrchestrator = () => {
    const navigate = useNavigate();
    const { eventId, eventDetails } = useTournamentDashboard();
    const { closeDialog, isOpen, openDialog } = useTournamentDialogs();

    // Tournament operations logic
    const { mutateAsync: startEvent, isPending: isStarting } = useStartTournamentMutation();
    const { mutateAsync: deleteTournament, isPending: isDeleting } = useDeleteTournamentMutation();

    const handleStartTournament = async () => {
        if (!eventId) return;
        try {
            await startEvent(eventId);
            toast.success("Tournament started successfully");
            closeDialog();
        } catch (error) {
            console.error("Failed to start tournament:", error);
            // toast is handled in hook
        }
    };

    const handleDeleteTournament = async () => {
        if (!eventId) return;
        try {
            await deleteTournament(eventId);
            toast.success("Tournament deleted successfully");
            navigate(ORGANIZER_ROUTES.TOURNAMENTS);
            closeDialog();
        } catch (error) {
            console.error("Failed to delete tournament:", error);
        }
    };

    return (
        <>
            <TournamentOperationsDialogs
                isDeleteOpen={isOpen('deleteTournament')}
                setIsDeleteOpen={(open: boolean) => open ? openDialog('deleteTournament') : closeDialog()}
                isDeleting={isDeleting}
                handleDelete={handleDeleteTournament}
                isStartOpen={isOpen('startTournament')}
                setIsStartOpen={(open: boolean) => open ? openDialog('startTournament') : closeDialog()}
                isStarting={isStarting}
                handleStart={handleStartTournament}
                tournamentTitle={eventDetails?.title || "Tournament"}
                eventType={eventDetails?.eventType}
            />

            {/* 2. Manage Actions */}
            <RoundsManagerDialogs />
            <GroupsGridDialogs />
        </>
    );
};
