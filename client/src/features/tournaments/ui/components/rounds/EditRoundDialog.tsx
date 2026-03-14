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
    initialStartTime?: string;
    initialDailyStartTime?: string;
    initialDailyEndTime?: string;
    initialGapMinutes?: number;
    initialGroupSize?: number;
    initialIsLeague?: boolean;
    initialLeaguePairingType?: string;
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const WINNER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

export const EditRoundDialog = ({ 
    roundId, 
    initialName, 
    initialQualifyingTeams = 2, 
    initialMatchesPerGroup = 1, 
    initialStartTime = "", 
    initialDailyStartTime = "13:00", 
    initialDailyEndTime = "21:00", 
    initialGapMinutes = 30, 
    initialGroupSize = 12, 
    initialIsLeague = false, 
    initialLeaguePairingType = "standard", 
    eventId, 
    open, 
    onOpenChange 
}: EditRoundDialogProps) => {
    const [editRoundName, setEditRoundName] = useState(initialName);
    const [qualifyingTeams, setQualifyingTeams] = useState<number>(initialQualifyingTeams);
    const [matchesPerGroup, setMatchesPerGroup] = useState<number>(initialMatchesPerGroup);
    const [startTime, setStartTime] = useState(initialStartTime ? initialStartTime.split('T')[0] : "");
    const [dailyStartTime, setDailyStartTime] = useState(initialDailyStartTime);
    const [dailyEndTime, setDailyEndTime] = useState(initialDailyEndTime);
    const [gapMinutes, setGapMinutes] = useState(initialGapMinutes);
    const [groupSize, setGroupSize] = useState(initialGroupSize);
    const [isLeague, setIsLeague] = useState(initialIsLeague);
    const [leaguePairingType, setLeaguePairingType] = useState(initialLeaguePairingType);
    
    const { mutateAsync: updateRound, isPending } = useUpdateRoundMutation();

    useEffect(() => {
        if (open) {
            setEditRoundName(initialName);
            setQualifyingTeams(initialQualifyingTeams);
            setMatchesPerGroup(initialMatchesPerGroup);
            setStartTime(initialStartTime ? initialStartTime.split('T')[0] : "");
            setDailyStartTime(initialDailyStartTime);
            setDailyEndTime(initialDailyEndTime);
            setGapMinutes(initialGapMinutes);
            setGroupSize(initialGroupSize);
            setIsLeague(initialIsLeague);
            setLeaguePairingType(initialLeaguePairingType);
        }
    }, [initialName, initialQualifyingTeams, initialMatchesPerGroup, initialStartTime, initialDailyStartTime, initialDailyEndTime, initialGapMinutes, initialGroupSize, initialIsLeague, initialLeaguePairingType, open]);

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
                matchesPerGroup,
                startTime,
                dailyStartTime,
                dailyEndTime,
                gapMinutes,
                groupSize,
                isLeague,
                leaguePairingType
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-purple-200/40 tracking-widest pl-1">Match Date</label>
                            <Input
                                type="date"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg h-11 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-purple-200/40 tracking-widest pl-1">Match Gap (Min)</label>
                            <Input
                                type="number"
                                value={gapMinutes}
                                onChange={(e) => setGapMinutes(parseInt(e.target.value) || 0)}
                                className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg h-11 text-sm"
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-purple-200/40 tracking-widest pl-1">Daily Start</label>
                            <Input
                                type="time"
                                value={dailyStartTime}
                                onChange={(e) => setDailyStartTime(e.target.value)}
                                className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg h-11 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-purple-200/40 tracking-widest pl-1">Daily End</label>
                            <Input
                                type="time"
                                value={dailyEndTime}
                                onChange={(e) => setDailyEndTime(e.target.value)}
                                className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg h-11 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-tight">Sync Notice</p>
                            <p className="text-[10px] text-amber-200/60 leading-relaxed italic">
                                Changing "Winners" will immediately update the qualification status for all groups in this round. Scheduling and size changes will apply to new groups or require group-level updates.
                            </p>
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
