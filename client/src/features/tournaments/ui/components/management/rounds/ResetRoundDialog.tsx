import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { useResetRoundMutation } from "@/features/tournaments/hooks";

interface ResetRoundDialogProps {
    roundId: string;
    roundName: string;
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReset?: () => void;
}

export const ResetRoundDialog = ({ roundId, roundName, eventId, open, onOpenChange, onReset }: ResetRoundDialogProps) => {
    const { mutateAsync: resetRound, isPending } = useResetRoundMutation();

    const handleReset = async () => {
        try {
            await resetRound({ roundId, eventId });
            onOpenChange(false);
            onReset?.();
        } catch (error) {
            // Error is handled by toast in hook
            console.error("Failed to reset round", error);
        }
    };

    return (
        <ConfirmActionDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Reset Round Data?"
            description={
                <div className="space-y-2">
                    <p>
                        Are you sure you want to reset <span className="text-gray-900 dark:text-white font-bold">{roundName}</span>?
                    </p>
                    <p className="text-sm">
                        This action will <span className="text-red-400 font-bold">permanently delete all groups and standings</span> for this round. 
                        The round itself will remain, allowing you to generate groups again and restart the tournament flow.
                    </p>
                </div>
            }
            actionLabel="Yes, Reset Round"
            onConfirm={handleReset}
            isLoading={isPending}
            variant="danger"
        />
    );
};
