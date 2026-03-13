import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useCreateRoundMutation } from "../../../hooks";

interface CreateRoundDialogProps {
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "tournament" | "invited-tournament" | "t1-special";
    roadmapIndex?: number;
    initialName?: string;
}

export const CreateRoundDialog = ({ eventId, open, onOpenChange, type, roadmapIndex, initialName }: CreateRoundDialogProps) => {
    const [newRoundName, setNewRoundName] = useState(initialName || "");
    const [newStartDate, setNewStartDate] = useState("");
    const [newDailyStartTime, setNewDailyStartTime] = useState("13:00");
    const [newDailyEndTime, setNewDailyEndTime] = useState("21:00");
    const [newGapMinutes, setNewGapMinutes] = useState(30);
    const [newMatches, setNewMatches] = useState(1);
    const [newQualify, setNewQualify] = useState(1);

    // Update name if initialName changes
    useEffect(() => {
        if (initialName && !newRoundName) {
            setNewRoundName(initialName);
        }
    }, [initialName, newRoundName]);

    const { mutateAsync: createRound, isPending: isCreating } = useCreateRoundMutation();

    const handleCreateRound = async () => {
        if (!eventId) return;
        if (!newRoundName.trim()) {
            toast.error("Please enter a round name");
            return;
        }
        if (!newStartDate) {
            toast.error("Please select a start date");
            return;
        }

        let startTime = newStartDate;

        try {
            await createRound({
                eventId,
                params: {
                    roundName: newRoundName,
                    startTime,
                    dailyStartTime: newDailyStartTime,
                    dailyEndTime: newDailyEndTime,
                    gapMinutes: newGapMinutes,
                    matchesPerGroup: newMatches,
                    qualifyingTeams: newQualify,
                    type: type || "tournament",
                    roadmapIndex
                }
            });
            onOpenChange(false);
            setNewRoundName("");
            setNewStartDate("");
            setNewDailyStartTime("13:00");
            setNewDailyEndTime("21:00");
            setNewGapMinutes(30);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Round</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Enter a name for this round (e.g., "Qualifiers", "Semi-Finals").
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-gray-300">Name</Label>
                        <Input
                            id="name"
                            value={newRoundName}
                            onChange={(e) => setNewRoundName(e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white focus:border-purple-500"
                            placeholder="Round Name"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-gray-300">Match Date</Label>
                        <Input
                            type="date"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>

                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-300">Daily Start</Label>
                                <Input
                                    type="time"
                                    value={newDailyStartTime}
                                    onChange={(e) => setNewDailyStartTime(e.target.value)}
                                    className="col-span-3 bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-300">Daily End</Label>
                                <Input
                                    type="time"
                                    value={newDailyEndTime}
                                    onChange={(e) => setNewDailyEndTime(e.target.value)}
                                    className="col-span-3 bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-300">Gap (Min)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={newGapMinutes}
                                    onChange={(e) => setNewGapMinutes(parseInt(e.target.value) || 0)}
                                    className="col-span-3 bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                    <div className="space-y-4 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Matches</Label>
                            <Input
                                type="number"
                                min="1"
                                value={newMatches}
                                onChange={(e) => setNewMatches(parseInt(e.target.value) || 1)}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Winner Selection</Label>
                            <Input
                                type="number"
                                min="0"
                                value={newQualify}
                                onChange={(e) => setNewQualify(parseInt(e.target.value) || 0)}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                                placeholder=""
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleCreateRound}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={isCreating}
                    >
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Round
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
