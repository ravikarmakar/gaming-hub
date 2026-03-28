import { useState, useEffect } from "react";
import { LoaderCircle as Loader2, Calendar, Clock, Trophy, Layers, ArrowRight, Info } from "lucide-react";
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

import { useCreateRoundMutation, useGetTournamentDetailsQuery } from "@/features/tournaments/hooks";

interface CreateRoundDialogProps {
    eventId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "tournament" | "invited-tournament" | "t1-special";
    roadmapIndex?: number;
    initialName?: string;
    isScrim?: boolean;
    onSuccess?: (roundId: string) => void;
}

const GAP_OPTIONS = [
    { label: "0 Min", value: "0" },
    { label: "10 Min", value: "10" },
    { label: "15 Min", value: "15" },
    { label: "20 Min", value: "20" },
    { label: "30 Min", value: "30" },
    { label: "45 Min", value: "45" },
    { label: "1 Hour", value: "60" },
    { label: "1.5 Hours", value: "90" },
    { label: "2 Hours", value: "120" },
];


export const CreateRoundDialog = ({ eventId, open, onOpenChange, type, roadmapIndex, initialName, isScrim = false, onSuccess }: CreateRoundDialogProps) => {
    const { data: _event } = useGetTournamentDetailsQuery(eventId);
    const [newRoundName, setNewRoundName] = useState(initialName || "");
    const [newStartDate, setNewStartDate] = useState("");
    const [newDailyStartTime, setNewDailyStartTime] = useState("13:00");
    const [newDailyEndTime, setNewDailyEndTime] = useState("21:00");
    const [newGapMinutes, setNewGapMinutes] = useState(30);
    const [newMatches, setNewMatches] = useState(1);
    const [newQualify, setNewQualify] = useState(1);

    const roadmap = _event?.roadmaps?.find(r => 
        type === "invited-tournament" ? r.type === "invitedTeams" :
        type === "t1-special" ? r.type === "t1-special" :
        r.type === "tournament"
    );
    const isLeague = roadmapIndex !== undefined && roadmap?.data?.[roadmapIndex]?.isLeague;

    // Get today's date in YYYY-MM-DD format for the min date restriction
    // Using local time to avoid UTC offset issues
    const today = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format

    // Update name if initialName changes
    useEffect(() => {
        if (initialName) {
            setNewRoundName(initialName);
        }
    }, [initialName]);

    // Initialize default values when dialog opens
    useEffect(() => {
        if (open) {
            setNewMatches(isLeague ? 6 : 1);
            setNewQualify(1);
        }
    }, [open, isLeague]);

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
            const result = await createRound({
                eventId,
                params: {
                    roundName: newRoundName,
                    startTime: newStartDate,
                    dailyStartTime: newDailyStartTime,
                    dailyEndTime: newDailyEndTime,
                    gapMinutes: newGapMinutes,
                    matchesPerGroup: newMatches,
                    qualifyingTeams: newQualify,
                    type: type || "tournament",
                    roadmapIndex
                }
            });

            if (result?._id && onSuccess) {
                onSuccess(result._id as string);
            }

            onOpenChange(false);
            setNewStartDate("");
            setNewDailyStartTime("13:00");
            setNewDailyEndTime("21:00");
            setNewMatches(1);
            setNewQualify(1);
            setNewGapMinutes(30);
        } catch (error) {
            console.error("Failed to create round", error);
            toast.error("Failed to create round. Please try again.");
        }
    };

    const [showTimeWindow, setShowTimeWindow] = useState(true);
    const [hasManuallyToggledTime, setHasManuallyToggledTime] = useState(false);

    // Auto-sync end time and gap for single match modes
    useEffect(() => {
        if (!showTimeWindow && newDailyStartTime) {
            setNewDailyEndTime(newDailyStartTime);
            setNewGapMinutes(0);
        }
    }, [showTimeWindow, newDailyStartTime]);

    // Derived logic for display, but now primarily controlled by the toggle
    // We only auto-toggle it if the user hasn't manually made a choice
    useEffect(() => {
        if (open && !hasManuallyToggledTime) {
            const isAutoSingle = isScrim || /grand (final|finale)/i.test(newRoundName);
            setShowTimeWindow(!isAutoSingle);
        }
    }, [open, newRoundName, isScrim, hasManuallyToggledTime]);

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

                <div className="px-6 pb-6 shadow-inner">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* Scheduling Mode Toggle */}
                            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-indigo-400" />
                                        Scheduling Mode
                                    </Label>
                                    <p className="text-[8px] text-indigo-200/40 font-medium">{showTimeWindow ? "Daily Time Window (Start to End)" : "Single Match Fixed Time"}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setShowTimeWindow(!showTimeWindow);
                                        setHasManuallyToggledTime(true);
                                    }}
                                    className={`h-7 px-3 text-[9px] font-black uppercase transition-all duration-300 ${showTimeWindow ? 'border-indigo-500/20 text-indigo-400' : 'bg-indigo-600 border-none shadow-lg shadow-indigo-600/20 text-white'}`}
                                >
                                    {showTimeWindow ? "Standard" : "Single Match"}
                                </Button>
                            </div>

                            {/* Match Date */}
                            <div className="space-y-1.5">
                                <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                    Match Date
                                </Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400 transition-colors pointer-events-none" />
                                    <Input
                                        type="date"
                                        min={today}
                                        value={newStartDate}
                                        onChange={(e) => setNewStartDate(e.target.value)}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onClick={(e) => e.currentTarget.showPicker()}
                                        className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white [color-scheme:dark] cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Daily Schedule Grid */}
                            <div className={!showTimeWindow ? "space-y-4" : "grid grid-cols-2 gap-4"}>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                        {!showTimeWindow ? "Match Start Time" : "Daily Start"}
                                    </Label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400 transition-colors pointer-events-none" />
                                        <Input
                                            type="time"
                                            value={newDailyStartTime}
                                            onChange={(e) => setNewDailyStartTime(e.target.value)}
                                            onKeyDown={(e) => e.preventDefault()}
                                            onClick={(e) => e.currentTarget.showPicker()}
                                            className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white [color-scheme:dark] cursor-pointer"
                                        />
                                    </div>
                                </div>
                                
                                {showTimeWindow && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                            Daily End
                                        </Label>
                                        <div className="relative group">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400 transition-colors pointer-events-none" />
                                            <Input
                                                type="time"
                                                value={newDailyEndTime}
                                                onChange={(e) => setNewDailyEndTime(e.target.value)}
                                                onKeyDown={(e) => e.preventDefault()}
                                                onClick={(e) => e.currentTarget.showPicker()}
                                                className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white [color-scheme:dark] cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gap and Matches */}
                            <div className={!showTimeWindow ? "space-y-4" : "grid grid-cols-2 gap-4"}>
                                {showTimeWindow && (
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
                                )}
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-purple-200/40 tracking-wider">
                                        Matches Count
                                    </Label>
                                    <div className="relative group">
                                        {isLeague ? (
                                            <Select
                                                value={newMatches.toString()}
                                                onValueChange={(v) => setNewMatches(parseInt(v))}
                                            >
                                                <SelectTrigger className="h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white">
                                                    <div className="flex items-center gap-2">
                                                        <Trophy className="w-3.5 h-3.5 text-yellow-500/50" />
                                                        <SelectValue placeholder="Select matches" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                                    <SelectItem value="6">12 Matches (6 per pairing)</SelectItem>
                                                    <SelectItem value="9">18 Matches (9 per pairing)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <>
                                                <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400 transition-colors" />
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={newMatches}
                                                    onChange={(e) => setNewMatches(parseInt(e.target.value) || 1)}
                                                    className="pl-9 h-10 text-xs bg-white/5 border-white/10 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-lg text-white"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
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
                                        {Array.from({ length: 24 }, (_, i) => (i + 1).toString()).map((val) => (
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

