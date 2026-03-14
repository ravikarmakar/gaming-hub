import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Check, Edit3, ListTodo, Map, Plus, Trash2, Trophy, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export const T1SpecialRoadmapSection = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const { register, control, watch, setValue } = useFormContext<EventFormValues>();
    const [isRoundsConfirmed, setIsRoundsConfirmed] = useState(false);
    const [isMappingSaved, setIsMappingSaved] = useState(false);
    const [leagueRoundIdx, setLeagueRoundIdx] = useState<number | null>(null);
    const [finaleRoundIdx, setFinaleRoundIdx] = useState<number | null>(null);
    const [isLeagueEnabled, setIsLeagueEnabled] = useState(false);
    const [isFinaleEnabled, setIsFinaleEnabled] = useState(false);
    const [isConfigEnabled, setIsConfigEnabled] = useState(false);


    const { fields, append, remove } = useFieldArray({
        control,
        name: "t1SpecialRoadmap",
    });

    const { append: appendMapping } = useFieldArray({
        control,
        name: "t1SpecialRoundMappings",
    });

    const roadmapData = watch("t1SpecialRoadmap") || [];
    const mainRoadmapData = watch("roadmap") || [];
    const currentMappings = watch("t1SpecialRoundMappings") || [];

    const eventType = watch("eventType");
    const hasT1SpecialValue = watch("hasT1SpecialRoadmap");
    const hasT1Special = hasT1SpecialValue ?? false;

    // Initialize with at least one round if active and not scrims
    useEffect(() => {
        if (fields.length === 0 && hasT1Special && eventType !== "scrims") {
            append({ name: "Round 1", title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "12-teams" });
        }
    }, [fields.length, append, hasT1Special, eventType]);

    // Resync state when editing existing roadmap
    useEffect(() => {
        if (fields.length > 0 && roadmapData.every(r => r.title?.trim() !== "")) {
            const hasLeague = roadmapData.findIndex(r => r.isLeague);
            const hasFinale = roadmapData.findIndex(r => r.isFinale);

            if (hasLeague >= 0 || hasFinale >= 0 || currentMappings.length > 0) {
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

            if (currentMappings.length > 0) {
                setIsMappingSaved(true);
            }
        }
    }, [fields.length, currentMappings.length, roadmapData]);

    const handleConfirmedToggle = () => {
        if (!isRoundsConfirmed) {
            const hasEmptyTitles = roadmapData.some(round => !round.title?.trim());
            if (hasEmptyTitles) {
                toast.error("Please provide a title for all rounds before saving");
                return;
            }
        }

        const nextState = !isRoundsConfirmed;

        // Save backups when entering edit mode

        setIsRoundsConfirmed(nextState);
    };

    if (eventType === "scrims") return null;

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Zap size={18} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-tight">T1 Special</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Configure specific roadmap for T1 Special stage</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                            <Label htmlFor="has-t1-special" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                {hasT1Special ? "YES, ENABLE" : "NO, SKIP"}
                            </Label>
                            <Checkbox
                                id="has-t1-special"
                                checked={hasT1Special}
                                onCheckedChange={(checked) => setValue("hasT1SpecialRoadmap", !!checked)}
                                className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-md"
                            />
                        </div>
                    </div>
                </GlassCard>
            )}

            {hasT1Special && (
                <GlassCard className={cn("p-8 space-y-6", isEmbedded && "border-none bg-transparent p-0 shadow-none")}>
                    <RoadmapHeader
                        title="T1 Special Roadmap"
                        description="Define the progression of the T1 Special stage"
                        icon={ListTodo}
                        isRoundsConfirmed={isRoundsConfirmed}
                        onToggleSave={handleConfirmedToggle}
                        isSavingDisabled={roadmapData.some(r => !r.title?.trim())}
                        accentColor="amber"
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Rounds Breakdown</h3>
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">Configure each stage of the T1 Special progression</p>
                            </div>
                            {!isRoundsConfirmed && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => append({ name: `Round ${fields.length + 1}`, title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "12-teams" })}
                                    className="h-7 px-3 text-[9px] font-black tracking-widest uppercase transition-all rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-amber-400 hover:text-white flex items-center gap-1.5"
                                >
                                    <Plus size={12} /> ADD ROUND
                                </Button>
                            )}
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
                                                {watch(`t1SpecialRoadmap.${index}.title`) || `Round ${index + 1}`}
                                            </span>
                                            <div className="flex items-center gap-2 ml-auto">
                                                {watch(`t1SpecialRoadmap.${index}.isLeague`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 uppercase tracking-tighter">League Mode</span>
                                                )}
                                                {watch(`t1SpecialRoadmap.${index}.isFinale`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 uppercase tracking-tighter">Grand Finale</span>
                                                )}
                                                {!watch(`t1SpecialRoadmap.${index}.isLeague`) && !watch(`t1SpecialRoadmap.${index}.isFinale`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-white/5 text-gray-600 uppercase tracking-tighter">Standard</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-[100px_1fr_40px] gap-4 items-center bg-white/[0.03] hover:bg-white/[0.05] p-1.5 px-4 rounded-xl border border-white/5 transition-all">
                                            <Input
                                                {...register(`t1SpecialRoadmap.${index}.name` as const)}
                                                readOnly
                                                className="bg-white/5 border-transparent h-8 rounded-lg text-[10px] font-bold cursor-not-allowed text-gray-500 text-center"
                                            />
                                            <Input
                                                {...register(`t1SpecialRoadmap.${index}.title` as const)}
                                                placeholder="Enter round name..."
                                                className="bg-transparent border-white/5 h-8 rounded-lg text-[10px] font-semibold flex-1 focus:border-amber-500/50 transition-colors"
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
                                        onClick={() => append({ name: "Round 1", title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "12-teams" })}
                                        className="mt-2 text-[10px] font-black text-amber-400 hover:text-white px-4 h-8"
                                    >
                                        + Add First Round
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isRoundsConfirmed && (
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Configuration Toggle */}
                            <div className="flex items-center gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                <Checkbox
                                    id="enable-config-t1-special"
                                    checked={isConfigEnabled}
                                    onCheckedChange={(checked) => setIsConfigEnabled(!!checked)}
                                    className="border-amber-500/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-md"
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="enable-config-t1-special" className="text-[10px] font-black text-white uppercase tracking-widest cursor-pointer">
                                        Enable Configuration
                                    </Label>
                                    <p className="text-[8px] text-amber-400/60 font-bold uppercase tracking-wider">
                                        {isConfigEnabled ? "CONFIGURE LEAGUE, FINALE & MERGE RULES" : "STANDARD MODE (NO SPECIAL RULES)"}
                                    </p>
                                </div>
                            </div>

                            {isConfigEnabled && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    {/* Section Header */}
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
                                                    id="is-league-t1-special"
                                                    checked={isLeagueEnabled}
                                                    onCheckedChange={(checked) => {
                                                        const isChecked = !!checked;
                                                        setIsLeagueEnabled(isChecked);
                                                        if (!isChecked) {
                                                            fields.forEach((_, i) => setValue(`t1SpecialRoadmap.${i}.isLeague`, false));
                                                            setLeagueRoundIdx(null);
                                                        } else if (leagueRoundIdx === null && fields.length > 0) {
                                                            const lastIdx = fields.length - 1;
                                                            setValue(`t1SpecialRoadmap.${lastIdx}.isLeague`, true);
                                                            setLeagueRoundIdx(lastIdx);
                                                        }
                                                    }}
                                                    className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-md"
                                                />
                                                <Label htmlFor="is-league-t1-special" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
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
                                                                fields.forEach((_, i) => setValue(`t1SpecialRoadmap.${i}.isLeague`, i === idx));
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
                                                                        className="text-[9px] font-black uppercase text-gray-400 focus:bg-amber-600 focus:text-white"
                                                                    >
                                                                        {watch(`t1SpecialRoadmap.${idx}.title`) ? `R${idx + 1}: ${watch(`t1SpecialRoadmap.${idx}.title`)}` : `Round ${idx + 1}`}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="flex items-center gap-2 bg-amber-500/5 px-3 py-1 rounded-lg border border-amber-500/10">
                                                        <Checkbox
                                                            id="league-18-teams-t1-special"
                                                            checked={leagueRoundIdx !== null && watch(`t1SpecialRoadmap.${leagueRoundIdx}.leagueType`) === "18-teams"}
                                                            onCheckedChange={(checked) => {
                                                                if (leagueRoundIdx !== null) {
                                                                    setValue(`t1SpecialRoadmap.${leagueRoundIdx}.leagueType`, checked ? "18-teams" : "12-teams");
                                                                }
                                                            }}
                                                            className="border-amber-500/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-sm h-3.5 w-3.5"
                                                        />
                                                        <Label htmlFor="league-18-teams-t1-special" className="text-[9px] font-black text-amber-400/80 uppercase tracking-wider cursor-pointer">
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
                                                    id="is-finale-t1-special"
                                                    checked={isFinaleEnabled}
                                                    onCheckedChange={(checked) => {
                                                        const isChecked = !!checked;
                                                        setIsFinaleEnabled(isChecked);
                                                        if (!isChecked) {
                                                            fields.forEach((_, i) => setValue(`t1SpecialRoadmap.${i}.isFinale`, false));
                                                            setFinaleRoundIdx(null);
                                                        } else if (finaleRoundIdx === null && fields.length > 0) {
                                                            const lastIdx = fields.length - 1;
                                                            setValue(`t1SpecialRoadmap.${lastIdx}.isFinale`, true);
                                                            setFinaleRoundIdx(lastIdx);
                                                        }
                                                    }}
                                                    className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-md"
                                                />
                                                <Label htmlFor="is-finale-t1-special" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
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
                                                                fields.forEach((_, i) => setValue(`t1SpecialRoadmap.${i}.isFinale`, i === idx));
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
                                                                        {watch(`t1SpecialRoadmap.${idx}.title`) ? `R${idx + 1}: ${watch(`t1SpecialRoadmap.${idx}.title`)}` : `Round ${idx + 1}`}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="flex items-center gap-2 bg-amber-500/5 px-3 py-1 rounded-lg border border-amber-500/10">
                                                        <Checkbox
                                                            id="finale-18-teams-t1-special"
                                                            checked={finaleRoundIdx !== null && watch(`t1SpecialRoadmap.${finaleRoundIdx}.grandFinaleType`) === "18-teams"}
                                                            onCheckedChange={(checked) => {
                                                                if (finaleRoundIdx !== null) {
                                                                    setValue(`t1SpecialRoadmap.${finaleRoundIdx}.grandFinaleType`, checked ? "18-teams" : "12-teams");
                                                                }
                                                            }}
                                                            className="border-amber-500/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-sm h-3.5 w-3.5"
                                                        />
                                                        <Label htmlFor="finale-18-teams-t1-special" className="text-[9px] font-black text-amber-400/80 uppercase tracking-wider cursor-pointer">
                                                            18 Teams Mode
                                                        </Label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. Merge Configuration */}
                                    <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 mt-8">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-rose-500/10 rounded-lg">
                                                    <Map size={16} className="text-rose-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[12px] font-black text-white uppercase tracking-tight">Merge Configuration</h4>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Select the main tournament round where this roadmap joins</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (!isMappingSaved) {
                                                        if (currentMappings.length === 0 || currentMappings[0].targetMainRound === undefined) {
                                                            toast.error("Please select a target main round");
                                                            return;
                                                        }
                                                        setIsMappingSaved(true);
                                                    } else {
                                                        setIsMappingSaved(false);
                                                    }
                                                }}
                                                className={cn(
                                                    "h-8 px-3 rounded-lg transition-all flex items-center gap-2",
                                                    isMappingSaved
                                                        ? "text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                                                        : "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                                                )}
                                            >
                                                {isMappingSaved ? (
                                                    <>
                                                        <Edit3 size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Save Change</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <div className="space-y-1 pt-4">
                                            {isMappingSaved ? (
                                                <div className="space-y-1">
                                                    {currentMappings.length > 0 ? (
                                                        <div className="flex items-center gap-3 py-2 px-4 bg-rose-500/5 rounded-lg border border-transparent hover:border-white/5 transition-all group">
                                                            <div className="flex items-center gap-2">
                                                                <Map size={12} className="text-rose-400" />
                                                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Merge Rule</span>
                                                                <span className="text-gray-700 font-bold">→</span>
                                                            </div>
                                                            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 flex-wrap">
                                                                <span>T1 Special Roadmap</span>
                                                                <span className="text-amber-400">
                                                                    ({fields.length > 0 ? (watch(`t1SpecialRoadmap.${fields.length - 1}.title`) || `Round ${fields.length}`) : "No Rounds"})
                                                                </span>
                                                                <span className="text-gray-600 font-medium">Merges to</span>
                                                                <span>Main Roadmap</span>
                                                                <span className="text-purple-400">
                                                                    ({currentMappings[0]?.targetMainRound !== undefined ? (watch(`roadmap.${currentMappings[0].targetMainRound}.title`) || `Round ${currentMappings[0].targetMainRound + 1}`) : "Not Mapped"})
                                                                </span>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center py-4">No mapping configured</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-l-2 border-rose-500/50 pl-2">Merge Point</Label>
                                                                <p className="text-[8px] text-gray-600 font-bold uppercase pl-2">Last round of this roadmap</p>
                                                            </div>
                                                            <div className="w-[180px]">
                                                                <Select
                                                                    value={currentMappings[0]?.targetMainRound?.toString() ?? ""}
                                                                    onValueChange={(v) => {
                                                                        const val = parseInt(v);
                                                                        if (currentMappings.length === 0) {
                                                                            const lastRoundIdx = Math.max(0, fields.length - 1);
                                                                            appendMapping({ startRound: lastRoundIdx, endRound: lastRoundIdx, targetMainRound: val });
                                                                        } else {
                                                                            setValue(`t1SpecialRoundMappings.0.targetMainRound`, val);
                                                                            const lastRoundIdx = Math.max(0, fields.length - 1);
                                                                            setValue(`t1SpecialRoundMappings.0.startRound`, lastRoundIdx);
                                                                            setValue(`t1SpecialRoundMappings.0.endRound`, lastRoundIdx);
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="bg-white/5 border-rose-500/20 h-8 rounded-lg text-[9px] font-black uppercase text-rose-400">
                                                                        <SelectValue placeholder="Select Main Round" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-[#0f0f12] border-white/10">
                                                                        {mainRoadmapData.length > 0 ? mainRoadmapData.map((_, i) => (
                                                                            <SelectItem key={i} value={i.toString()} className="text-[9px] font-black uppercase text-gray-400 focus:bg-rose-600 focus:text-white">
                                                                                R{i + 1}: {watch(`roadmap.${i}.title`) || 'Unnamed'}
                                                                            </SelectItem>
                                                                        )) : (
                                                                            <SelectItem value="-1" disabled className="text-[9px] font-black uppercase text-gray-500">
                                                                                No Main Rounds Added Yet
                                                                            </SelectItem>
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
};
