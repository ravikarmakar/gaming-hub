import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteRoundMutation } from "../../../hooks";

interface DeleteRoundDialogProps {
    roundId: string;
    roundName: string;
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted?: () => void;
}

export const DeleteRoundDialog = ({ roundId, roundName, eventId, open, onOpenChange, onDeleted }: DeleteRoundDialogProps) => {
    const { mutateAsync: deleteRound, isPending } = useDeleteRoundMutation();

    const handleDelete = async () => {
        try {
            await deleteRound({ roundId, eventId });
            onOpenChange(false);
            onDeleted?.();
        } catch (error) {
            console.error("Failed to delete round", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-red-400">Delete Round?</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Are you sure you want to delete <strong>{roundName}</strong>?
                        This will permanently delete all groups and leaderboards associated with this round.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-white/5"
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Delete Round
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
