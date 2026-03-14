import { useState, useEffect } from "react";
import { Loader2, Layers, Trophy } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditRoundDialogProps {
    roundId: string;
    initialName: string;
    initialQualifyingTeams?: number;
    initialMatchesPerGroup?: number;
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const WINNER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

export const EditRoundDialog = ({ roundId, initialName, initialQualifyingTeams = 2, initialMatchesPerGroup = 1, eventId, open, onOpenChange }: EditRoundDialogProps) => {
    const [editRoundName, setEditRoundName] = useState(initialName);
    const [qualifyingTeams, setQualifyingTeams] = useState<number>(initialQualifyingTeams);
    const [matchesPerGroup, setMatchesPerGroup] = useState<number>(initialMatchesPerGroup);
    
    const { mutateAsync: updateRound, isPending } = useUpdateRoundMutation();

    useEffect(() => {
        if (open) {
            setEditRoundName(initialName);
            setQualifyingTeams(initialQualifyingTeams);
            setMatchesPerGroup(initialMatchesPerGroup);
        }
    }, [initialName, initialQualifyingTeams, initialMatchesPerGroup, open]);

    const handleSave = async () => {
        if (!editRoundName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        try {
            await updateRound({ 
                roundId, 
                eventId, 
                roundName: editRoundName,
                qualifyingTeams,
                matchesPerGroup 
            });
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update round");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-brand-dark/98 backdrop-blur-2xl border border-purple-500/20 text-white p-6 shadow-2xl shadow-purple-500/20">
                <DialogHeader className="pb-4 border-b border-white/5">
                    <DialogTitle className="text-xl font-black italic font-orbitron tracking-tight text-white uppercase flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-500" />
                        Edit Round Settings
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-purple-200/40 tracking-widest pl-1">Stage Name</label>
                        <Input
                            value={editRoundName}
                            onChange={(e) => setEditRoundName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg h-11 text-sm"
                            placeholder="e.g. Grand Finale"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-purple-200/40 tracking-widest pl-1 flex items-center gap-2">
                                Winners
                                <Trophy className="w-3 h-3 text-yellow-500/50" />
                            </label>
                            <Select
                                value={qualifyingTeams.toString()}
                                onValueChange={(v) => setQualifyingTeams(parseInt(v))}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg h-11 text-sm">
                                    <SelectValue placeholder="Select qualifiers" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                    {WINNER_OPTIONS.map((val) => (
                                        <SelectItem key={val} value={val} className="focus:bg-purple-500/20 focus:text-white transition-colors">
                                            {val} {parseInt(val) === 1 ? 'Winner' : 'Winners'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-purple-200/40 tracking-widest pl-1">Matches</label>
                            <Input
                                type="number"
                                value={matchesPerGroup}
                                onChange={(e) => setMatchesPerGroup(parseInt(e.target.value) || 1)}
                                className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg h-11 text-sm"
                                min={1}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-2">
                    <Button
                        onClick={handleSave}
                        className="w-full h-11 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-lg font-black text-xs tracking-widest shadow-lg shadow-purple-600/10 text-white font-orbitron"
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isPending ? "SAVING..." : "SAVE CHANGES"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
