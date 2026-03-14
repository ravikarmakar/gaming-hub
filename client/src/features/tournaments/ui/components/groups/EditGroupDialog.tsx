import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
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
    const [subGroups, setSubGroups] = useState<{ name: string; teams: string[] }[]>([]);

    const { mutateAsync: updateGroup, isPending } = useUpdateGroupMutation();

    useEffect(() => {
        if (group && open) {
            setEditName(group.groupName);
            setEditMatches(group.totalMatch);
            setEditRoomId(group.roomId?.toString() || "");
            setEditPassword(group.roomPassword?.toString() || "");
            const mappedSubGroups = (group.subGroups || []).map(sg => ({
                name: sg.name,
                teams: sg.teams.map((t: any) => typeof t === 'string' ? t : t._id)
            }));
            setSubGroups(mappedSubGroups);

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
                    matchTime: combinedMatchTime,
                    subGroups: group.isLeague ? subGroups : undefined
                }
            });
            toast.success("Group updated!");
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update group. Please try again.");
        }
    };

    const handleSubGroupChange = (teamId: string, subGroupName: string) => {
        setSubGroups(prev => {
            // 1. Create a fresh copy and remove team from all groups
            const newSubGroups = prev.map(sg => ({
                ...sg,
                teams: sg.teams.filter(id => id !== teamId)
            }));
            
            // 2. Add team to the target group
            const targetIdx = newSubGroups.findIndex(sg => sg.name === subGroupName);
            if (targetIdx !== -1) {
                newSubGroups[targetIdx] = {
                    ...newSubGroups[targetIdx],
                    teams: [...newSubGroups[targetIdx].teams, teamId]
                };
            } else {
                newSubGroups.push({ name: subGroupName, teams: [teamId] });
            }
            return newSubGroups;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-gray-900 border-white/10 text-white overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Edit Group Details</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 py-4">
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

                    {group?.isLeague && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <Label className="text-xs font-black uppercase text-purple-400 tracking-widest pl-1">
                                Sub-Group Team Assignment
                            </Label>
                            <div className="space-y-2">
                                {group.teams?.map((team: any) => {
                                    const teamId = team.teamId?._id || team._id;
                                    const teamName = team.teamId?.teamName || team.teamName || "Unknown Team";
                                    const currentSg = subGroups.find(sg => sg.teams.includes(teamId))?.name || "Unassigned";

                                    return (
                                        <div key={teamId} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                                            <span className="text-xs font-bold truncate max-w-[150px]">{teamName}</span>
                                            <div className="flex gap-1">
                                                {["Sub-Group A", "Sub-Group B", "Sub-Group C"].map(sgName => (
                                                    <Button
                                                        key={sgName}
                                                        size="sm"
                                                        variant={currentSg === sgName ? "default" : "outline"}
                                                        onClick={() => handleSubGroupChange(teamId, sgName)}
                                                        className={`h-7 px-2 text-[10px] font-bold ${
                                                            currentSg === sgName 
                                                                ? 'bg-purple-600 border-none' 
                                                                : 'border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {sgName.split(' ')[1]}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
