import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { useDeleteGroupMutation } from "@/features/tournaments/hooks";
import { Group } from "@/features/tournaments/types";
import toast from "react-hot-toast";

interface DeleteGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    group: Group | null;
}

export const DeleteGroupDialog = ({ open, onOpenChange, eventId, group }: DeleteGroupDialogProps) => {
    const { mutateAsync: deleteGroup, isPending } = useDeleteGroupMutation();

    const handleDelete = async () => {
        if (!group) return;
        try {
            await deleteGroup({ groupId: group._id, eventId });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to delete group", error);
            toast.error("Failed to delete group. Please try again.");
        }
    };

    return (
        <ConfirmActionDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Group?"
            description={
                <div className="space-y-2">
                    <p>
                        Are you sure you want to delete <span className="text-gray-900 dark:text-white font-bold">{group?.groupName || "this group"}</span>?
                    </p>
                    <p className="text-sm text-red-500 font-medium">
                        This action cannot be undone. All teams in this group will be removed and its leaderboard will be deleted.
                    </p>
                </div>
            }
            actionLabel="Yes, Delete Group"
            onConfirm={handleDelete}
            isLoading={isPending}
            variant="danger"
        />
    );
};
