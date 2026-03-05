import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useUpdateRoundMutation } from "../../../hooks";

interface EditRoundDialogProps {
    roundId: string;
    initialName: string;
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditRoundDialog = ({ roundId, initialName, eventId, open, onOpenChange }: EditRoundDialogProps) => {
    const [editRoundName, setEditRoundName] = useState(initialName);
    const { mutateAsync: updateRound, isPending } = useUpdateRoundMutation();

    useEffect(() => {
        if (open) {
            setEditRoundName(initialName);
        }
    }, [initialName, open]);

    const handleSave = async () => {
        if (!editRoundName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        try {
            await updateRound({ roundId, eventId, roundName: editRoundName });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Edit Round Name</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        value={editRoundName}
                        onChange={(e) => setEditRoundName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
