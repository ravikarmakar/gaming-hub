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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Group, useUpdateGroupMutation } from "../../../hooks";

interface EditGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    group: Group | null;
}

export const EditGroupDialog = ({ open, onOpenChange, eventId, group }: EditGroupDialogProps) => {
    const [editName, setEditName] = useState("");
    const [editMatches, setEditMatches] = useState(1);
    const [editRoomId, setEditRoomId] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");

    const { mutateAsync: updateGroup, isPending } = useUpdateGroupMutation();

    useEffect(() => {
        if (group && open) {
            setEditName(group.groupName);
            setEditMatches(group.totalMatch);
            setEditRoomId(group.roomId?.toString() || "");
            setEditPassword(group.roomPassword?.toString() || "");

            if (group.matchTime) {
                const date = new Date(group.matchTime);
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date.getTime() - offset)).toISOString();
                setEditDate(localISOTime.split('T')[0]);
                setEditTime(localISOTime.split('T')[1].slice(0, 5));
            } else {
                setEditDate("");
                setEditTime("");
            }
        }
    }, [group, open]);

    const handleSaveGroup = async () => {
        if (!group) return;

        let combinedMatchTime = undefined;
        if (editDate && editTime) {
            combinedMatchTime = new Date(`${editDate}T${editTime}`).toISOString();
        }

        try {
            await updateGroup({
                groupId: group._id,
                eventId,
                payload: {
                    groupName: editName,
                    totalMatch: editMatches,
                    roomId: editRoomId ? parseInt(editRoomId) : undefined,
                    roomPassword: editPassword ? parseInt(editPassword) : undefined,
                    matchTime: combinedMatchTime
                }
            });
            toast.success("Group updated!");
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Edit Group Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-gray-300">Name</Label>
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-gray-300">Matches</Label>
                        <Input
                            type="number"
                            value={editMatches}
                            onChange={(e) => setEditMatches(parseInt(e.target.value) || 1)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-gray-300">Match Date</Label>
                        <Input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-gray-300">Match Time</Label>
                        <Input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-gray-300">Room ID</Label>
                        <Input
                            type="number"
                            value={editRoomId}
                            onChange={(e) => setEditRoomId(e.target.value)}
                            placeholder="Enter Room ID"
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-gray-300">Password</Label>
                        <Input
                            type="number"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Enter Password"
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveGroup} disabled={isPending} className="bg-purple-600 hover:bg-purple-700">
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
