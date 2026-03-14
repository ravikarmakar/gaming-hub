import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ListTodo, Trash2, Trophy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { GlassCard } from "@/features/events/ui/components/ThemedComponents";
import { RoadmapHeader } from "./roadmaps/RoadmapHeader";
import { EventFormValues } from "@/features/events/lib";

export const RoadmapSection = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const { register, control, watch, setValue } = useFormContext<EventFormValues>();
    const [isRoundsConfirmed, setIsRoundsConfirmed] = useState(false);
    const [leagueRoundIdx, setLeagueRoundIdx] = useState<number | null>(null);
    const [finaleRoundIdx, setFinaleRoundIdx] = useState<number | null>(null);
    const [isLeagueEnabled, setIsLeagueEnabled] = useState(false);
    const [isFinaleEnabled, setIsFinaleEnabled] = useState(false);
    const { fields, append, remove } = useFieldArray({
        control,
        name: "roadmap",
    });

    const eventType = watch("eventType");
    const roadmapData = watch("roadmap") || [];

    // Initialize with at least one round if not scrims
    useEffect(() => {
        if (fields.length === 0 && eventType !== "scrims") {
            append({ name: "Round 1", title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "12-teams" });
        }
    }, [fields.length, append, eventType]);

    // Resync state when editing existing roadmap
    useEffect(() => {
        if (fields.length > 0 && roadmapData.every(r => r.title?.trim() !== "")) {
            // Check if any round is marked as league or finale to auto-confirm & expand the config
            const hasLeague = roadmapData.findIndex(r => r.isLeague);
            const hasFinale = roadmapData.findIndex(r => r.isFinale);

            if (hasLeague >= 0 || hasFinale >= 0) {
                // To avoid flashing/resetting, only set these if they aren't already set
                setIsRoundsConfirmed(true);
            }

            if (hasLeague >= 0) {
                setIsLeagueEnabled(true);
                setLeagueRoundIdx(hasLeague);
            }
            if (hasFinale >= 0) {
                setIsFinaleEnabled(true);
                setFinaleRoundIdx(hasFinale);
            }
        }
    }, [fields.length]); // Only run on mount or fields initialization

    const handleConfirmedToggle = () => {
        if (!isRoundsConfirmed) {
            // Validation: Check if all rounds have titles
            const hasEmptyTitles = roadmapData.some(round => !round.title?.trim());
            if (hasEmptyTitles) {
                return;
            }
            // Save backup before confirming (though confirmation is the "safe" state, 
            // the transition to edit mode is where we want to backup)
        }

        const nextState = !isRoundsConfirmed;
        
        // If entering edit mode, save current rounds as backup

        setIsRoundsConfirmed(nextState);

        // If unconfirming, we might want to reset finale/league status on all rounds
        if (isRoundsConfirmed) { // This means we were confirmed and now we are NOT (nextState is false)
            // Actually, nextState is !isRoundsConfirmed. 
            // If isRoundsConfirmed was true, nextState is false (Edit Mode).
        }
        
        // If we were confirmed and are now becoming unconfirmed (entering edit mode)
        // the original code had some reset logic here but it's dangerous if user wants to just edit names.
        // The user wants a "Cancel" button, so we should keep the state and only reset if they cancel.
    };


    const hasRoadmapValue = watch("hasRoadmap");
    // Default to true for standard tournaments if not explicitly set
    const hasRoadmap = hasRoadmapValue ?? (eventType === "tournament");

    if (eventType === "scrims") return null;

    return (
        <div className="space-y-6">
            {!isEmbedded && eventType === "invited-tournament" && (
                <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Trophy size={18} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-tight">eSports Invitation</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Do you want to create a roadmap for this invitation?</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                            <Label htmlFor="has-roadmap" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                {hasRoadmap ? "YES, ENABLE" : "NO, SKIP"}
                            </Label>
                            <Checkbox
                                id="has-roadmap"
                                checked={hasRoadmap}
                                onCheckedChange={(checked) => setValue("hasRoadmap", !!checked)}
                                className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-md"
                            />
                        </div>
                    </div>
                </GlassCard>
            )}

            {hasRoadmap && (
                <GlassCard className={cn("p-8 space-y-6", isEmbedded && "border-none bg-transparent p-0 shadow-none")}>
                    <RoadmapHeader
                        title="Tournament Roadmap"
                        description="Define the progression of your tournament"
                        icon={ListTodo}
                        isRoundsConfirmed={isRoundsConfirmed}
                        onToggleSave={handleConfirmedToggle}
                        onAddRound={() => append({ name: `Round ${fields.length + 1}`, title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "12-teams" })}
                        isSavingDisabled={roadmapData.some(r => !r.title?.trim())}
                        accentColor="purple"
                    />

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Rounds Breakdown</h3>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">Configure each stage of your competition</p>
                        </div>
                        <div className="space-y-2">
                            {!isRoundsConfirmed && fields.length > 0 && (
                                <div className="grid grid-cols-[100px_1fr_40px] gap-4 px-4 py-1">
                                    <Label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Round Number</Label>
                                    <Label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Round Name (e.g. Qualifiers)</Label>
                                    <span></span>
                                </div>
                            )}
                            {fields.map((field, index) => (
                                <div key={field.id} className="group/roadmap relative">
                                    {isRoundsConfirmed ? (
                                        <div className="flex items-center gap-3 py-2 px-4 bg-white/[0.02] border border-transparent hover:border-white/5 rounded-lg transition-all group">
                                            <div className="flex items-center gap-2 min-w-[80px]">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Round {index + 1}</span>
                                                <span className="text-gray-700 font-bold">→</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-white tracking-wide">
                                                {watch(`roadmap.${index}.title`) || `Round ${index + 1}`}
                                            </span>
                                            <div className="flex items-center gap-2 ml-auto">
                                                {watch(`roadmap.${index}.isLeague`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 uppercase tracking-tighter">League Mode</span>
                                                )}
                                                {watch(`roadmap.${index}.isFinale`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 uppercase tracking-tighter">Grand Finale</span>
                                                )}
                                                {!watch(`roadmap.${index}.isLeague`) && !watch(`roadmap.${index}.isFinale`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-white/5 text-gray-600 uppercase tracking-tighter">Standard</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-[100px_1fr_40px] gap-4 items-center bg-white/[0.03] hover:bg-white/[0.05] p-1.5 px-4 rounded-xl border border-white/5 transition-all">
                                            <Input
                                                {...register(`roadmap.${index}.name` as const)}
                                                value={`Round ${index + 1}`}
                                                readOnly
                                                className="bg-white/5 border-transparent h-8 rounded-lg text-[10px] font-bold cursor-not-allowed text-gray-500 text-center"
                                            />
                                            <Input
                                                {...register(`roadmap.${index}.title` as const)}
                                                placeholder="Enter round name..."
                                                className="bg-transparent border-white/5 h-8 rounded-lg text-[10px] font-semibold flex-1 focus:border-purple-500/50 transition-colors"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                    <p className="text-xs font-bold text-gray-500">No rounds added yet</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => append({ name: "Round 1", title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "Standard" })}
                                        className="mt-2 text-[10px] font-black text-purple-400 hover:text-white px-4 h-8"
                                    >
                                        + Add First Round
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isRoundsConfirmed && (
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Trophy size={18} className="text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Configuration</h4>
                                    <p className="text-[10px] text-gray-500 font-medium">Finalize the rules for the last stage</p>
                                </div>
                            </div>

                            {/* 1. League Match Type Configuration */}
                            <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5 relative overflow-hidden transition-all duration-300">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is-league"
                                            checked={isLeagueEnabled}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setIsLeagueEnabled(isChecked);
                                                if (!isChecked) {
                                                    fields.forEach((_, i) => setValue(`roadmap.${i}.isLeague`, false));
                                                    setLeagueRoundIdx(null);
                                                } else if (leagueRoundIdx === null && fields.length > 0) {
                                                    const lastIdx = fields.length - 1;
                                                    setValue(`roadmap.${lastIdx}.isLeague`, true);
                                                    setLeagueRoundIdx(lastIdx);
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-md"
                                        />
                                        <Label htmlFor="is-league" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            League Match Type
                                        </Label>
                                    </div>

                                    {isLeagueEnabled && (
                                        <div className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-300">
                                            <div className="w-[160px]">
                                                <Select
                                                    value={leagueRoundIdx?.toString() ?? ""}
                                                    onValueChange={(value) => {
                                                        const idx = parseInt(value);
                                                        fields.forEach((_, i) => setValue(`roadmap.${i}.isLeague`, i === idx));
                                                        setLeagueRoundIdx(idx);
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 h-8 rounded-lg text-[9px] font-black uppercase text-gray-400">
                                                        <SelectValue placeholder="Select Round" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#0f0f12] border-white/10">
                                                        {fields.map((field, idx) => (
                                                            <SelectItem
                                                                key={field.id}
                                                                value={idx.toString()}
                                                                className="text-[9px] font-black uppercase text-gray-400 focus:bg-purple-600 focus:text-white"
                                                            >
                                                                {watch(`roadmap.${idx}.title`) ? `R${idx + 1}: ${watch(`roadmap.${idx}.title`)}` : `Round ${idx + 1}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center gap-2 bg-purple-500/5 px-3 py-1 rounded-lg border border-purple-500/10">
                                                <Checkbox
                                                    id="league-18-teams"
                                                    checked={leagueRoundIdx !== null && watch(`roadmap.${leagueRoundIdx}.leagueType`) === "18-teams"}
                                                    onCheckedChange={(checked) => {
                                                        if (leagueRoundIdx !== null) {
                                                            setValue(`roadmap.${leagueRoundIdx}.leagueType`, checked ? "18-teams" : "12-teams");
                                                        }
                                                    }}
                                                    className="border-purple-500/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-sm h-3.5 w-3.5"
                                                />
                                                <Label htmlFor="league-18-teams" className="text-[9px] font-black text-purple-400/80 uppercase tracking-wider cursor-pointer">
                                                    18 Teams Mode
                                                </Label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Grand Finale Type Configuration */}
                            <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5 relative overflow-hidden transition-all duration-300">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is-finale"
                                            checked={isFinaleEnabled}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setIsFinaleEnabled(isChecked);
                                                if (!isChecked) {
                                                    fields.forEach((_, i) => setValue(`roadmap.${i}.isFinale`, false));
                                                    setFinaleRoundIdx(null);
                                                } else if (finaleRoundIdx === null && fields.length > 0) {
                                                    const lastIdx = fields.length - 1;
                                                    setValue(`roadmap.${lastIdx}.isFinale`, true);
                                                    setFinaleRoundIdx(lastIdx);
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-md"
                                        />
                                        <Label htmlFor="is-finale" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            Grand Finale Type
                                        </Label>
                                    </div>

                                    {isFinaleEnabled && (
                                        <div className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-300">
                                            <div className="w-[160px]">
                                                <Select
                                                    value={finaleRoundIdx?.toString() ?? ""}
                                                    onValueChange={(value) => {
                                                        const idx = parseInt(value);
                                                        fields.forEach((_, i) => setValue(`roadmap.${i}.isFinale`, i === idx));
                                                        setFinaleRoundIdx(idx);
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 h-8 rounded-lg text-[9px] font-black uppercase text-gray-400">
                                                        <SelectValue placeholder="Select Round" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#0f0f12] border-white/10">
                                                        {fields.map((field, idx) => (
                                                            <SelectItem
                                                                key={field.id}
                                                                value={idx.toString()}
                                                                className="text-[9px] font-black uppercase text-gray-400 focus:bg-amber-600 focus:text-white"
                                                            >
                                                                {watch(`roadmap.${idx}.title`) ? `R${idx + 1}: ${watch(`roadmap.${idx}.title`)}` : `Round ${idx + 1}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center gap-2 bg-amber-500/5 px-3 py-1 rounded-lg border border-amber-500/10">
                                                <Checkbox
                                                    id="finale-18-teams"
                                                    checked={finaleRoundIdx !== null && watch(`roadmap.${finaleRoundIdx}.grandFinaleType`) === "18-teams"}
                                                    onCheckedChange={(checked) => {
                                                        if (finaleRoundIdx !== null) {
                                                            setValue(`roadmap.${finaleRoundIdx}.grandFinaleType`, checked ? "18-teams" : "12-teams");
                                                        }
                                                    }}
                                                    className="border-amber-500/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-sm h-3.5 w-3.5"
                                                />
                                                <Label htmlFor="finale-18-teams" className="text-[9px] font-black text-amber-400/80 uppercase tracking-wider cursor-pointer">
                                                    18 Teams Mode
                                                </Label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
};

