import { useState, useEffect } from "react";
import { Loader2, Calendar, Clock, Trophy, Layers, ArrowRight, Info } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useCreateRoundMutation } from "../../../hooks";

interface CreateRoundDialogProps {
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "tournament" | "invited-tournament" | "t1-special";
    roadmapIndex?: number;
    initialName?: string;
}

const GAP_OPTIONS = [
    { label: "10 Min", value: "10" },
    { label: "15 Min", value: "15" },
    { label: "20 Min", value: "20" },
    { label: "30 Min", value: "30" },
    { label: "45 Min", value: "45" },
    { label: "1 Hour", value: "60" },
    { label: "1.5 Hours", value: "90" },
    { label: "2 Hours", value: "120" },
];

const WINNER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

export const CreateRoundDialog = ({ eventId, open, onOpenChange, type, roadmapIndex, initialName }: CreateRoundDialogProps) => {
    const [newRoundName, setNewRoundName] = useState(initialName || "");
    const [newStartDate, setNewStartDate] = useState("");
    const [newDailyStartTime, setNewDailyStartTime] = useState("13:00");
    const [newDailyEndTime, setNewDailyEndTime] = useState("21:00");
    const [newGapMinutes, setNewGapMinutes] = useState(30);
    const [newMatches, setNewMatches] = useState(1);
    const [newQualify, setNewQualify] = useState(1);
    const [isLeague, setIsLeague] = useState(false);
    const [groupSize, setGroupSize] = useState(12);
    const [pairingType, setPairingType] = useState<"standard" | "axb-bxc-axc">("standard");

    // Get today's date in YYYY-MM-DD format for the min date restriction
    // Using local time to avoid UTC offset issues
    const today = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format

    // Update name if initialName changes
    useEffect(() => {
        if (initialName) {
            setNewRoundName(initialName);
        }
    }, [initialName]);

    const { mutateAsync: createRound, isPending: isCreating } = useCreateRoundMutation();

    const handleCreateRound = async () => {
        if (!eventId) return;
        if (!newRoundName.trim()) {
            toast.error("Round name is missing");
            return;
        }
        if (!newStartDate) {
            toast.error("Please select a match date");
            return;
        }

        try {
            await createRound({
                eventId,
                params: {
                    roundName: newRoundName,
                    startTime: newStartDate,
                    dailyStartTime: newDailyStartTime,
                    dailyEndTime: newDailyEndTime,
                    gapMinutes: newGapMinutes,
                    matchesPerGroup: newMatches,
                    qualifyingTeams: newQualify,
                    groupSize: groupSize,
                    isLeague: isLeague,
                    leaguePairingType: pairingType,
                    type: type || "tournament",
                    roadmapIndex
                }
            });
            onOpenChange(false);
            setNewStartDate("");
            setNewDailyStartTime("13:00");
            setNewDailyEndTime("21:00");
            setNewGapMinutes(30);
            setNewMatches(1);
            setNewQualify(1);
            setIsLeague(false);
            setGroupSize(12);
            setPairingType("standard");
            toast.success("Round created successfully");
        } catch (error) {
            console.error("Failed to create round", error);
            toast.error("Failed to create round. Please try again.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="sm:max-w-[500px] bg-brand-dark/98 backdrop-blur-2xl border border-purple-500/20 text-white p-0 overflow-hidden shadow-2xl shadow-purple-500/20"
            >
                <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600" />

                <DialogHeader className="px-6 pt-6 pb-2">
                    <div className="space-y-1 text-center">
                        <DialogTitle className="text-xl font-black italic font-orbitron tracking-tight text-white uppercase flex items-center justify-center gap-2">
                            <Layers className="w-5 h-5 text-purple-500" />
                            Create New Round
                        </DialogTitle>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest text-purple-400">
                                {newRoundName || "Untitled Round"}
                            </span>
                        </div>
                        <DialogDescription className="text-purple-200/40 text-[10px] font-medium tracking-wide mt-2">
                            Configure schedules and rules for this tournament stage.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="px-6 pb-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* Match Date */}
                            <div className="space-y-1.5">
                                <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                    Match Date
                                </Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        type="date"
                                        min={today}
                                        value={newStartDate}
                                        onChange={(e) => setNewStartDate(e.target.value)}
                                        className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white"
                                    />
                                </div>
                            </div>

                            {/* Daily Schedule Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                        Daily Start
                                    </Label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                        <Input
                                            type="time"
                                            value={newDailyStartTime}
                                            onChange={(e) => setNewDailyStartTime(e.target.value)}
                                            className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                        Daily End
                                    </Label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                        <Input
                                            type="time"
                                            value={newDailyEndTime}
                                            onChange={(e) => setNewDailyEndTime(e.target.value)}
                                            className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gap and Matches */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                        Match Gap
                                    </Label>
                                    <Select
                                        value={newGapMinutes.toString()}
                                        onValueChange={(v) => setNewGapMinutes(parseInt(v))}
                                    >
                                        <SelectTrigger className="h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                            {GAP_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                        Matches Count
                                    </Label>
                                    <div className="relative group">
                                        <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" />
                                        <Input
                                            type="number"
                                            min="1"
                                            value={newMatches}
                                            onChange={(e) => setNewMatches(parseInt(e.target.value) || 1)}
                                            className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* League Mode Configuration */}
                            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                                            <Layers className="w-3 h-3 text-purple-400" />
                                            League Mode
                                        </Label>
                                        <p className="text-[8px] text-purple-200/40 font-medium">Single group with shared leaderboard.</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isLeague ? "default" : "outline"}
                                        onClick={() => {
                                            const newState = !isLeague;
                                            setIsLeague(newState);
                                            if (newState) {
                                                setGroupSize(18);
                                                setNewMatches(6);
                                                setNewQualify(6);
                                                setPairingType("axb-bxc-axc");
                                            } else {
                                                setGroupSize(12);
                                                setNewMatches(1);
                                                setNewQualify(1);
                                                setPairingType("standard");
                                            }
                                        }}
                                        className={`h-7 px-3 text-[9px] font-black uppercase ${isLeague ? 'bg-purple-600 border-none' : 'border-purple-500/20 text-purple-400'}`}
                                    >
                                        {isLeague ? "ON" : "OFF"}
                                    </Button>
                                </div>

                                {isLeague && (
                                    <div className="grid grid-cols-2 gap-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                Group Size
                                            </Label>
                                            <Select
                                                value={groupSize.toString()}
                                                onValueChange={(v) => {
                                                    const size = parseInt(v);
                                                    setGroupSize(size);
                                                    if (size === 18) {
                                                        setNewMatches(6);
                                                        setNewQualify(6);
                                                        setPairingType("axb-bxc-axc");
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                                    <SelectItem value="12">12 Teams</SelectItem>
                                                    <SelectItem value="18">18 Teams</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                                Match Logic
                                            </Label>
                                            <Select
                                                value={pairingType}
                                                onValueChange={(v: any) => setPairingType(v)}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                                    <SelectItem value="standard">Standard (All Play)</SelectItem>
                                                    <SelectItem value="axb-bxc-axc">AxB, BxC, AxC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                                {isLeague && groupSize === 18 && pairingType === "axb-bxc-axc" && (
                                    <div className="mt-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                                        <p className="text-[8px] text-blue-300 leading-tight">
                                            <span className="font-black">Pairing Info:</span> 18 teams are split into 3 groups (A, B, C) of 6 teams. Each match features only 12 teams (2 groups pairing). Total 6 matches ensures every group plays 4 matches. Winners are selected from the final 18-team shared leaderboard.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Winner Selection */}
                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                                <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider flex items-center gap-2">
                                    Winner Selection
                                    <Info className="w-2.5 h-2.5 text-purple-500/40" />
                                </Label>
                                <Select
                                    value={newQualify.toString()}
                                    onValueChange={(v) => setNewQualify(parseInt(v))}
                                >
                                    <SelectTrigger className="h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-3.5 h-3.5 text-yellow-500/50" />
                                            <SelectValue placeholder="Select winners" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                        {WINNER_OPTIONS.map((val) => (
                                            <SelectItem key={val} value={val}>
                                                {val} {parseInt(val) === 1 ? 'Winner' : 'Winners'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[8px] text-purple-200/20 font-medium">
                                    * Number of teams that will qualify for the next stage.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    onClick={handleCreateRound}
                                    disabled={isCreating}
                                    className="w-full h-11 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-lg font-black text-[10px] tracking-widest shadow-lg shadow-purple-600/10 group font-orbitron text-white"
                                >
                                    {isCreating ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            CREATING ROUND...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            CREATE ROUND
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </DialogContent>
        </Dialog>
    );
};

