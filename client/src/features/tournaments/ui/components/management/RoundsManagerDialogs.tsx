import React from "react";
import { CreateRoundDialog } from "./rounds/CreateRoundDialog";
import { EditRoundDialog } from "./rounds/EditRoundDialog";
import { ResetRoundDialog } from "./rounds/ResetRoundDialog";
import { DeleteRoundDialog } from "./rounds/DeleteRoundDialog";
import { RoundInfoDialog } from "./rounds/RoundInfoDialog";
import { Round } from "@/features/tournaments/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle as Loader2, AlertTriangle } from "lucide-react";

import { useTournamentDialogs } from "@/features/tournaments/context/TournamentDialogContext";
import { useRoundsContext } from "@/features/tournaments/context/TournamentRoundsContext";

/**
 * A wrapper for all round-level management dialogs.
 * This helps keep the TournamentDialogOrchestrator clean.
 */
export const RoundsManagerDialogs: React.FC = () => {
    const { 
        isOpen, 
        dialogData, 
        closeDialog 
    } = useTournamentDialogs();

    const {
        eventId,
        selectedRound,
        handleCreateGroups,
        handleManualCreateGroup,
        handleMergeTeams,
    } = useRoundsContext();

    // Mapping new context actions and data to existing dialog names/props
    const isCreateRoundOpen = isOpen('createRound');
    const isEditRoundOpen = isOpen('editRound');
    const isResetRoundOpen = isOpen('resetRound');
    const isDeleteRoundOpen = isOpen('deleteRound');
    const isRoundInfoOpen = isOpen('roundInfo');
    const isConfirmGroupsOpen = isOpen('confirmGroups');
    const isConfirmManualGroupOpen = isOpen('confirmManual');
    const isConfirmMergeOpen = isOpen('mergeTeamsFromPrevious');

    const setIsCreateRoundOpen = (open: boolean) => !open && closeDialog();
    const setIsEditRoundOpen = (open: boolean) => !open && closeDialog();
    const setIsResetRoundOpen = (open: boolean) => !open && closeDialog();
    const setIsDeleteRoundOpen = (open: boolean) => !open && closeDialog();
    const setIsRoundInfoOpen = (open: boolean) => !open && closeDialog();
    const setIsConfirmGroupsOpen = (open: boolean) => !open && closeDialog();
    const setIsConfirmManualGroupOpen = (open: boolean) => !open && closeDialog();
    const setIsConfirmMergeOpen = (open: boolean) => !open && closeDialog();

    // Use dialogData or fallback to selectedRound
    const actionRound = (dialogData as Round) || selectedRound;
    
    // Check pending states from dialog metadata or context if available
    // For now, we'll keep it simple as these are usually managed in the context we just created.
    // However, the context needs to provide these creating/merging states too if not already there.
    return (
        <>
            {/* 1. Standard Round Dialogs */}
            <CreateRoundDialog
                eventId={eventId}
                open={isCreateRoundOpen}
                onOpenChange={setIsCreateRoundOpen}
                type="tournament" // Default to standard tournament round
            />

            {actionRound && (
                <>
                    <EditRoundDialog
                        eventId={eventId}
                        roundId={actionRound._id}
                        initialName={actionRound.roundName}
                        initialQualifyingTeams={actionRound.qualifyingTeams}
                        initialMatchesPerGroup={actionRound.matchesPerGroup}
                        initialStartTime={actionRound.startTime}
                        initialDailyStartTime={actionRound.dailyStartTime}
                        initialDailyEndTime={actionRound.dailyEndTime}
                        initialGapMinutes={actionRound.gapMinutes}
                        initialGroupSize={actionRound.groupSize}
                        initialIsLeague={actionRound.isLeague}
                        open={isEditRoundOpen}
                        onOpenChange={setIsEditRoundOpen}
                    />

                    <ResetRoundDialog
                        eventId={eventId}
                        roundId={actionRound._id}
                        roundName={actionRound.roundName}
                        open={isResetRoundOpen}
                        onOpenChange={setIsResetRoundOpen}
                    />

                    <DeleteRoundDialog
                        eventId={eventId}
                        roundId={actionRound._id}
                        roundName={actionRound.roundName}
                        open={isDeleteRoundOpen}
                        onOpenChange={setIsDeleteRoundOpen}
                    />

                    <RoundInfoDialog
                        round={actionRound}
                        open={isRoundInfoOpen}
                        onOpenChange={setIsRoundInfoOpen}
                    />
                </>
            )}

            {/* 2. Generic Confirmations for intensive operations */}
            <ConfirmActionDialog
                title="Auto-Generate Groups"
                description="This will automatically distribute all checked-in teams into groups based on the round configuration. Existing groups in this round will be overwritten."
                isOpen={isConfirmGroupsOpen}
                onOpenChange={setIsConfirmGroupsOpen}
                isPending={false} // Managed by confirm action buttons in header if needed, or by round actions hook
                onConfirm={() => selectedRound && handleCreateGroups(selectedRound._id)}
            />

            <ConfirmActionDialog
                title="Create Group Manually"
                description="This will add a single empty group to this round. You can then drag and drop teams into it."
                isOpen={isConfirmManualGroupOpen}
                onOpenChange={setIsConfirmManualGroupOpen}
                isPending={false}
                onConfirm={() => selectedRound && handleManualCreateGroup(selectedRound._id)}
            />

            <ConfirmActionDialog
                title="Merge Teams from Previous Round"
                description="This will pull all qualifying teams from the previous round into this one. Use this when the previous round is finished."
                isOpen={isConfirmMergeOpen}
                onOpenChange={setIsConfirmMergeOpen}
                isPending={false}
                onConfirm={() => selectedRound && handleMergeTeams(selectedRound._id)}
            />
        </>
    );
};

interface ConfirmActionDialogProps {
    title: string;
    description: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
    title,
    description,
    isOpen,
    onOpenChange,
    onConfirm,
    isPending
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-brand-dark/95 border-white/10 text-white">
                <DialogHeader>
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <DialogTitle className="uppercase font-black font-orbitron italic tracking-tight">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400 text-sm">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Confirm Action
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
