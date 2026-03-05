import { useState, useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { ListTodo, Plus, Trash2, Trophy, Users, CheckCircle2, Edit3 } from "lucide-react";
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
import { GlassCard, SectionHeader } from "@/features/events/ui/components/ThemedComponents";
import { EventFormValues } from "@/features/events/lib";

export const RoadmapSection = () => {
    const { register, control, watch, setValue } = useFormContext<EventFormValues>();
    const [isRoundsConfirmed, setIsRoundsConfirmed] = useState(false);
    const [isLeagueSaved, setIsLeagueSaved] = useState(false);
    const [isFinaleSaved, setIsFinaleSaved] = useState(false);
    const [leagueRoundIdx, setLeagueRoundIdx] = useState<number | null>(null);
    const [finaleRoundIdx, setFinaleRoundIdx] = useState<number | null>(null);
    const [isLeagueEnabled, setIsLeagueEnabled] = useState(false);
    const [isFinaleEnabled, setIsFinaleEnabled] = useState(false);
    const [showValidationError, setShowValidationError] = useState(false);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "roadmap",
    });

    const roadmapData = watch("roadmap") || [];

    // Initialize with at least one round
    useEffect(() => {
        if (fields.length === 0) {
            append({ name: "Round 1", title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "Standard" });
        }
    }, [fields.length, append]);

    const handleConfirmedToggle = () => {
        if (!isRoundsConfirmed) {
            // Validation: Check if all rounds have titles
            const hasEmptyTitles = roadmapData.some(round => !round.title?.trim());
            if (hasEmptyTitles) {
                setShowValidationError(true);
                return;
            }
        }

        setShowValidationError(false);
        setIsRoundsConfirmed(!isRoundsConfirmed);
        // If unconfirming, we might want to reset finale/league status on all rounds
        if (isRoundsConfirmed) {
            roadmapData.forEach((_, idx) => {
                setValue(`roadmap.${idx}.isFinale`, false);
                setValue(`roadmap.${idx}.isLeague`, false);
            });
            setIsFinaleSaved(false);
            setLeagueRoundIdx(null);
            setFinaleRoundIdx(null);
            setIsLeagueEnabled(false);
            setIsFinaleEnabled(false);
        }
    };

    const eventType = watch("eventType");
    const hasRoadmapValue = watch("hasRoadmap");
    // Default to true for standard tournaments if not explicitly set
    const hasRoadmap = hasRoadmapValue ?? (eventType === "tournament");

    if (eventType === "scrims") return null;

    return (
        <div className="space-y-6">
            {eventType === "invited-tournament" && (
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
                <GlassCard className="p-8 space-y-6">
                    <SectionHeader title="Tournament Roadmap" icon={ListTodo} />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Rounds & Stages</p>
                                <p className="text-[10px] text-gray-500 font-medium pl-1 mt-1">Define the progression of your tournament</p>
                            </div>
                            {!isRoundsConfirmed && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => append({ name: `Round ${fields.length + 1}`, title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "Standard" })}
                                    className="h-auto p-0 text-[10px] font-black text-purple-400 hover:text-white hover:bg-transparent transition-colors shadow-none"
                                >
                                    <Plus size={14} className="mr-1" /> ADD ROUND
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="group/roadmap relative pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className="space-y-4">
                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all ${isRoundsConfirmed ? "opacity-60 grayscale-[0.5]" : ""}`}>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Round Number</Label>
                                                <Input
                                                    {...register(`roadmap.${index}.name` as const)}
                                                    value={`Round ${index + 1}`}
                                                    readOnly
                                                    className="bg-white/10 border-white/10 h-10 rounded-lg text-sm font-bold cursor-not-allowed text-gray-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Round Name (e.g. Qualifiers)</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        {...register(`roadmap.${index}.title` as const)}
                                                        placeholder="Enter round name..."
                                                        readOnly={isRoundsConfirmed}
                                                        className={`bg-white/5 border-white/10 h-10 rounded-lg text-sm font-bold flex-1 focus:border-purple-500/50 transition-colors ${isRoundsConfirmed ? "cursor-not-allowed" : ""}`}
                                                    />
                                                    {!isRoundsConfirmed && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => remove(index)}
                                                            className="h-10 w-10 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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

                            {fields.length > 0 && (
                                <div className="flex flex-col items-center gap-4 pt-2">
                                    {showValidationError && (
                                        <div className="flex items-center gap-2 text-rose-500 bg-rose-500/5 px-4 py-2 rounded-lg border border-rose-500/20 animate-in shake-in duration-300">
                                            <Trophy size={14} className="rotate-180" />
                                            <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Please fill all round names before confirming</p>
                                        </div>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleConfirmedToggle}
                                        className={`h-9 px-6 text-[10px] font-black tracking-widest uppercase transition-all ${isRoundsConfirmed
                                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                            : roadmapData.some(r => !r.title?.trim()) && !isRoundsConfirmed
                                                ? "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                                                : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40"
                                            }`}
                                    >
                                        {isRoundsConfirmed ? (
                                            <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Rounds Confirmed - Edit?</span>
                                        ) : (
                                            "Confirm Roadmap Rounds"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isRoundsConfirmed && (
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is-league"
                                            checked={isLeagueEnabled}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setIsLeagueEnabled(isChecked);
                                                if (!isChecked) {
                                                    fields.forEach((_, i) => setValue(`roadmap.${i}.isLeague`, false));
                                                    setIsLeagueSaved(false);
                                                    setLeagueRoundIdx(null);
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-md"
                                        />
                                        <Label htmlFor="is-league" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            League Match Type
                                        </Label>
                                        {isLeagueEnabled && !isLeagueSaved && (
                                            <div className="w-[180px] animate-in slide-in-from-left-2 duration-300">
                                                <Select
                                                    value={leagueRoundIdx?.toString() ?? ""}
                                                    onValueChange={(value) => {
                                                        const idx = parseInt(value);
                                                        fields.forEach((_, i) => setValue(`roadmap.${i}.isLeague`, i === idx));
                                                        setLeagueRoundIdx(idx);
                                                        setIsLeagueSaved(false);
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
                                        )}
                                    </div>

                                    {isLeagueSaved && (
                                        <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsLeagueSaved(false)}
                                                className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                            >
                                                <Edit3 size={14} />
                                            </Button>
                                            <div className="text-emerald-500">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isLeagueEnabled && (
                                    <div className="pt-2">
                                        {(() => {
                                            const leagueRound = leagueRoundIdx !== null ? roadmapData[leagueRoundIdx as number] : null;
                                            return isLeagueSaved ? (
                                                <div className="flex items-center gap-4 bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 animate-in slide-in-from-top-1 duration-300">
                                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                                        <Users size={16} className="text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">
                                                            {leagueRoundIdx !== null ? `Round ${leagueRoundIdx + 1}: ${leagueRound?.title || "League Round"}` : "None"}
                                                        </p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                            {leagueRound?.leagueType === "18-teams"
                                                                ? "18 Teams • 3 Groups (A vs B, B vs C, C vs A)"
                                                                : "12 Teams • Single Group League"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                leagueRoundIdx !== null && (
                                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Select League Team Size</Label>
                                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                                                                {(["12-teams", "18-teams"] as const).map((type) => (
                                                                    <Controller
                                                                        key={type}
                                                                        name={`roadmap.${leagueRoundIdx as number}.leagueType` as const}
                                                                        control={control}
                                                                        render={({ field: { value, onChange } }) => (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    onChange(type);
                                                                                    setIsLeagueSaved(false);
                                                                                }}
                                                                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${value === type
                                                                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                                                                                    : "text-gray-500 hover:text-gray-300"
                                                                                    }`}
                                                                            >
                                                                                {type.replace("-", " ")}
                                                                            </button>
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            onClick={() => setIsLeagueSaved(true)}
                                                            className="w-full bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-10 border border-white/10"
                                                        >
                                                            Save League Changes
                                                        </Button>
                                                    </div>
                                                )
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* 2. Grand Finale Type Configuration */}
                            <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is-finale"
                                            checked={isFinaleEnabled}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setIsFinaleEnabled(isChecked);
                                                if (!isChecked) {
                                                    fields.forEach((_, i) => setValue(`roadmap.${i}.isFinale`, false));
                                                    setIsFinaleSaved(false);
                                                    setFinaleRoundIdx(null);
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-md"
                                        />
                                        <Label htmlFor="is-finale" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            Grand Finale Type
                                        </Label>
                                        {isFinaleEnabled && !isFinaleSaved && (
                                            <div className="w-[180px] animate-in slide-in-from-left-2 duration-300">
                                                <Select
                                                    value={finaleRoundIdx?.toString() ?? ""}
                                                    onValueChange={(value) => {
                                                        const idx = parseInt(value);
                                                        fields.forEach((_, i) => setValue(`roadmap.${i}.isFinale`, i === idx));
                                                        setFinaleRoundIdx(idx);
                                                        setIsFinaleSaved(false);
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
                                        )}
                                    </div>

                                    {isFinaleSaved && (
                                        <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsFinaleSaved(false)}
                                                className="h-8 w-8 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                            >
                                                <Edit3 size={14} />
                                            </Button>
                                            <div className="text-emerald-500">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isFinaleEnabled && (
                                    <div className="pt-2">
                                        {(() => {
                                            const finaleRound = finaleRoundIdx !== null ? roadmapData[finaleRoundIdx as number] : null;
                                            return isFinaleSaved ? (
                                                <div className="flex items-center gap-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 animate-in slide-in-from-top-1 duration-300">
                                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                                        <Trophy size={16} className="text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">
                                                            {finaleRoundIdx !== null ? `Round ${finaleRoundIdx + 1}: ${finaleRound?.title || "Grand Finale"}` : "None"}
                                                        </p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                            {finaleRound?.grandFinaleType === "18-teams"
                                                                ? "18 Teams • 18 Team Finale (3 Groups)"
                                                                : "12 Teams • 12 Team Grand Finale Stage"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                finaleRoundIdx !== null && (
                                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Select Finale Size</Label>
                                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                                                                {(["12-teams", "18-teams"] as const).map((type) => (
                                                                    <Controller
                                                                        key={type}
                                                                        name={`roadmap.${finaleRoundIdx as number}.grandFinaleType` as const}
                                                                        control={control}
                                                                        render={({ field: { value, onChange } }) => (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    onChange(type);
                                                                                    setIsFinaleSaved(false);
                                                                                }}
                                                                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${value === type
                                                                                    ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40"
                                                                                    : "text-gray-500 hover:text-gray-300"
                                                                                    }`}
                                                                            >
                                                                                {type.replace("-", " ")}
                                                                            </button>
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            onClick={() => setIsFinaleSaved(true)}
                                                            className="w-full bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-10 border border-white/10"
                                                        >
                                                            Save Finale Changes
                                                        </Button>
                                                    </div>
                                                )
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
};

