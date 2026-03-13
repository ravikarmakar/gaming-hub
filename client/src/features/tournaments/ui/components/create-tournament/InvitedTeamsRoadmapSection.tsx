import { useState, useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { ListTodo, Plus, Trash2, Trophy, Users, CheckCircle2, Edit3, Map } from "lucide-react";
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
import toast from "react-hot-toast";

export const InvitedTeamsRoadmapSection = () => {
    const { register, control, watch, setValue } = useFormContext<EventFormValues>();
    const [isRoundsConfirmed, setIsRoundsConfirmed] = useState(false);
    const [isLeagueSaved, setIsLeagueSaved] = useState(false);
    const [isFinaleSaved, setIsFinaleSaved] = useState(false);
    const [isMappingSaved, setIsMappingSaved] = useState(false);
    const [leagueRoundIdx, setLeagueRoundIdx] = useState<number | null>(null);
    const [finaleRoundIdx, setFinaleRoundIdx] = useState<number | null>(null);
    const [isLeagueEnabled, setIsLeagueEnabled] = useState(false);
    const [isFinaleEnabled, setIsFinaleEnabled] = useState(false);
    const [showValidationError, setShowValidationError] = useState(false);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "invitedTeamsRoadmap",
    });

    const { fields: mappingFields, append: appendMapping, remove: removeMapping } = useFieldArray({
        control,
        name: "invitedRoundMappings",
    });

    const roadmapData = watch("invitedTeamsRoadmap") || [];
    const mainRoadmapData = watch("roadmap") || [];

    const eventType = watch("eventType");
    const hasInvitedTeamsValue = watch("hasInvitedTeams");
    const hasInvitedTeams = hasInvitedTeamsValue ?? false;

    // Initialize with at least one round if active and not scrims
    useEffect(() => {
        if (fields.length === 0 && hasInvitedTeams && eventType !== "scrims") {
            append({ name: "Round 1", title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "Standard" });
        }
    }, [fields.length, append, hasInvitedTeams, eventType]);

    // Resync state when editing existing roadmap
    useEffect(() => {
        if (fields.length > 0 && roadmapData.every(r => r.title?.trim() !== "")) {
            const hasLeague = roadmapData.findIndex(r => r.isLeague);
            const hasFinale = roadmapData.findIndex(r => r.isFinale);

            if (hasLeague >= 0 || hasFinale >= 0 || mappingFields.length > 0) {
                setIsRoundsConfirmed(true);
            }

            if (hasLeague >= 0) {
                setIsLeagueEnabled(true);
                setLeagueRoundIdx(hasLeague);
                setIsLeagueSaved(true);
            }

            if (hasFinale >= 0) {
                setIsFinaleEnabled(true);
                setFinaleRoundIdx(hasFinale);
                setIsFinaleSaved(true);
            }

            if (mappingFields.length > 0) {
                setIsMappingSaved(true);
            }
        }
    }, [fields.length, mappingFields.length, roadmapData]);

    const handleConfirmedToggle = () => {
        if (!isRoundsConfirmed) {
            const hasEmptyTitles = roadmapData.some(round => !round.title?.trim());
            if (hasEmptyTitles) {
                setShowValidationError(true);
                return;
            }
        }

        setShowValidationError(false);
        const nextState = !isRoundsConfirmed;
        setIsRoundsConfirmed(nextState);

        if (isRoundsConfirmed) {
            // Reset all configs when unconfirming rounds to avoid data mismatch
            roadmapData.forEach((_, idx) => {
                setValue(`invitedTeamsRoadmap.${idx}.isFinale`, false);
                setValue(`invitedTeamsRoadmap.${idx}.isLeague`, false);
            });
            setValue("invitedRoundMappings", []);
            setIsLeagueSaved(false);
            setIsFinaleSaved(false);
            setIsMappingSaved(false);
            setLeagueRoundIdx(null);
            setFinaleRoundIdx(null);
            setIsLeagueEnabled(false);
            setIsFinaleEnabled(false);
        }
    };

    if (eventType === "scrims") return null;

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-indigo-500/20 bg-indigo-500/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Users size={18} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Invited Teams</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Do you want to invite teams to this tournament?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <Label htmlFor="has-invited-teams" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                            {hasInvitedTeams ? "YES, ENABLE" : "NO, SKIP"}
                        </Label>
                        <Checkbox
                            id="has-invited-teams"
                            checked={hasInvitedTeams}
                            onCheckedChange={(checked) => setValue("hasInvitedTeams", !!checked)}
                            className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 rounded-md"
                        />
                    </div>
                </div>
            </GlassCard>

            {hasInvitedTeams && (
                <GlassCard className="p-8 space-y-6">
                    <SectionHeader title="Invited Teams Roadmap" icon={ListTodo} />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Rounds & Stages</p>
                                <p className="text-[10px] text-gray-500 font-medium pl-1 mt-1">Define the progression of the invited teams tournament</p>
                            </div>
                            {!isRoundsConfirmed && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => append({ name: `Round ${fields.length + 1}`, title: "", isFinale: false, isLeague: false, leagueType: "12-teams", grandFinaleType: "Standard" })}
                                    className="h-auto p-0 text-[10px] font-black text-indigo-400 hover:text-white hover:bg-transparent transition-colors shadow-none"
                                >
                                    <Plus size={14} className="mr-1" /> ADD ROUND
                                </Button>
                            )}
                        </div>

                        <div className="space-y-1">
                            {fields.map((field, index) => (
                                <div key={field.id} className="group/roadmap relative">
                                    {isRoundsConfirmed ? (
                                        <div className="flex items-center gap-3 py-2 px-4 bg-white/[0.02] border border-transparent hover:border-white/5 rounded-lg transition-all group">
                                            <div className="flex items-center gap-2 min-w-[80px]">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Round {index + 1}</span>
                                                <span className="text-gray-700 font-bold">→</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-white tracking-wide">
                                                {watch(`invitedTeamsRoadmap.${index}.title`) || `Round ${index + 1}`}
                                            </span>
                                            <div className="flex items-center gap-2 ml-auto">
                                                {watch(`invitedTeamsRoadmap.${index}.isLeague`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 uppercase tracking-tighter">League Mode</span>
                                                )}
                                                {watch(`invitedTeamsRoadmap.${index}.isFinale`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 uppercase tracking-tighter">Grand Finale</span>
                                                )}
                                                {!watch(`invitedTeamsRoadmap.${index}.isLeague`) && !watch(`invitedTeamsRoadmap.${index}.isFinale`) && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-white/5 text-gray-600 uppercase tracking-tighter">Standard</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Round Number</Label>
                                                        <Input
                                                            {...register(`invitedTeamsRoadmap.${index}.name` as const)}
                                                            value={`Round ${index + 1}`}
                                                            readOnly
                                                            className="bg-white/10 border-white/10 h-10 rounded-lg text-sm font-bold cursor-not-allowed text-gray-400"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Round Name (e.g. Qualifiers)</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                {...register(`invitedTeamsRoadmap.${index}.title` as const)}
                                                                placeholder="Enter round name..."
                                                                className="bg-white/5 border-white/10 h-10 rounded-lg text-sm font-bold flex-1 focus:border-indigo-500/50 transition-colors"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => remove(index)}
                                                                className="h-10 w-10 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                        className="mt-2 text-[10px] font-black text-indigo-400 hover:text-white px-4 h-8"
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
                                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40"
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
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Trophy size={18} className="text-indigo-500" />
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
                                            id="is-league-invited"
                                            checked={isLeagueEnabled}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setIsLeagueEnabled(isChecked);
                                                if (!isChecked) {
                                                    fields.forEach((_, i) => setValue(`invitedTeamsRoadmap.${i}.isLeague`, false));
                                                    setIsLeagueSaved(false);
                                                    setLeagueRoundIdx(null);
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 rounded-md"
                                        />
                                        <Label htmlFor="is-league-invited" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            League Match Type
                                        </Label>
                                        {isLeagueEnabled && !isLeagueSaved && (
                                            <div className="w-[180px] animate-in slide-in-from-left-2 duration-300">
                                                <Select
                                                    value={leagueRoundIdx?.toString() ?? ""}
                                                    onValueChange={(value) => {
                                                        const idx = parseInt(value);
                                                        fields.forEach((_, i) => setValue(`invitedTeamsRoadmap.${i}.isLeague`, i === idx));
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
                                                                className="text-[9px] font-black uppercase text-gray-400 focus:bg-indigo-600 focus:text-white"
                                                            >
                                                                {watch(`invitedTeamsRoadmap.${idx}.title`) ? `R${idx + 1}: ${watch(`invitedTeamsRoadmap.${idx}.title`)}` : `Round ${idx + 1}`}
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
                                                className="h-8 w-8 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
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
                                                <div className="flex items-center gap-3 py-2 px-4 bg-indigo-500/5 rounded-lg group">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={12} className="text-indigo-400" />
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">League Config</span>
                                                        <span className="text-gray-700 font-bold">→</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-300">
                                                        {leagueRoundIdx !== null ? `R${leagueRoundIdx + 1}: ${leagueRound?.title}` : "None"} • {leagueRound?.leagueType?.replace("-", " ")}
                                                    </span>
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
                                                                        name={`invitedTeamsRoadmap.${leagueRoundIdx as number}.leagueType` as const}
                                                                        control={control}
                                                                        render={({ field: { value, onChange } }) => (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    onChange(type);
                                                                                    setIsLeagueSaved(false);
                                                                                }}
                                                                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${value === type
                                                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
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
                                            id="is-finale-invited"
                                            checked={isFinaleEnabled}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setIsFinaleEnabled(isChecked);
                                                if (!isChecked) {
                                                    fields.forEach((_, i) => setValue(`invitedTeamsRoadmap.${i}.isFinale`, false));
                                                    setIsFinaleSaved(false);
                                                    setFinaleRoundIdx(null);
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 rounded-md"
                                        />
                                        <Label htmlFor="is-finale-invited" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            Grand Finale Type
                                        </Label>
                                        {isFinaleEnabled && !isFinaleSaved && (
                                            <div className="w-[180px] animate-in slide-in-from-left-2 duration-300">
                                                <Select
                                                    value={finaleRoundIdx?.toString() ?? ""}
                                                    onValueChange={(value) => {
                                                        const idx = parseInt(value);
                                                        fields.forEach((_, i) => setValue(`invitedTeamsRoadmap.${i}.isFinale`, i === idx));
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
                                                                className="text-[9px] font-black uppercase text-gray-400 focus:bg-indigo-600 focus:text-white"
                                                            >
                                                                {watch(`invitedTeamsRoadmap.${idx}.title`) ? `R${idx + 1}: ${watch(`invitedTeamsRoadmap.${idx}.title`)}` : `Round ${idx + 1}`}
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
                                                <div className="flex items-center gap-3 py-2 px-4 bg-amber-500/5 rounded-lg group">
                                                    <div className="flex items-center gap-2">
                                                        <Trophy size={12} className="text-amber-400" />
                                                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Finale Config</span>
                                                        <span className="text-gray-700 font-bold">→</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-300">
                                                        {finaleRoundIdx !== null ? `R${finaleRoundIdx + 1}: ${finaleRound?.title}` : "None"} • {finaleRound?.grandFinaleType?.replace("-", " ")}
                                                    </span>
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
                                                                        name={`invitedTeamsRoadmap.${finaleRoundIdx as number}.grandFinaleType` as const}
                                                                        control={control}
                                                                        render={({ field: { value, onChange } }) => (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    onChange(type);
                                                                                    setIsFinaleSaved(false);
                                                                                }}
                                                                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${value === type
                                                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
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

                            {/* 3. Merge Configuration */}
                            <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 mt-8">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 rounded-lg">
                                            <Map size={16} className="text-rose-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-[12px] font-black text-white uppercase tracking-tight">Merge Configuration</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Map invited rounds to main tournament rounds</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!isMappingSaved && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => appendMapping({ startRound: 0, endRound: 0, targetMainRound: 0 })}
                                                className="h-8 px-3 text-[10px] font-black text-rose-400 hover:text-white hover:bg-rose-500 hover:border-transparent border border-rose-500/20 transition-all shadow-none"
                                            >
                                                <Plus size={14} className="mr-1" /> ADD MAPPING RULE
                                            </Button>
                                        )}
                                        {isMappingSaved && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsMappingSaved(false)}
                                                className="h-8 w-8 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                                <Edit3 size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 pt-4">
                                    {isMappingSaved ? (
                                        <div className="space-y-1">
                                            {mappingFields.map((field, index) => (
                                                <div key={field.id} className="flex items-center gap-3 py-2 px-4 bg-rose-500/5 rounded-lg border border-transparent hover:border-white/5 transition-all group">
                                                    <div className="flex items-center gap-2">
                                                        <Map size={12} className="text-rose-400" />
                                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Rule {index + 1}</span>
                                                        <span className="text-gray-700 font-bold">→</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-300">
                                                        Invited R{watch(`invitedRoundMappings.${index}.startRound`) + 1} - R{watch(`invitedRoundMappings.${index}.endRound`) + 1}
                                                        <span className="mx-2 text-gray-600 font-medium">Merges to</span>
                                                        Main R{watch(`invitedRoundMappings.${index}.targetMainRound`) + 1}
                                                    </span>
                                                </div>
                                            ))}
                                            {mappingFields.length === 0 && (
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center py-4">No mapping rules defined</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                {mappingFields.map((field, index) => (
                                                    <div key={field.id} className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-2 flex-1 w-full">
                                                            <div className="space-y-2 flex-1">
                                                                <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">From Invited Round</Label>
                                                                <Controller
                                                                    name={`invitedRoundMappings.${index}.startRound` as const}
                                                                    control={control}
                                                                    render={({ field: { value, onChange } }) => (
                                                                        <Select value={value?.toString() ?? ""} onValueChange={(v) => onChange(parseInt(v))}>
                                                                            <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-lg text-[10px] font-black uppercase text-gray-400 w-full">
                                                                                <SelectValue placeholder="Select" />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="bg-[#0f0f12] border-white/10">
                                                                                {fields.map((_, i) => (
                                                                                    <SelectItem key={i} value={i.toString()} className="text-[9px] font-black uppercase text-gray-400 focus:bg-rose-600 focus:text-white">
                                                                                        R{i + 1}: {watch(`invitedTeamsRoadmap.${i}.title`) || 'Unnamed'}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}
                                                                />
                                                            </div>
                                                            <span className="text-gray-500 font-bold mt-6">-</span>
                                                            <div className="space-y-2 flex-1">
                                                                <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">To Invited Round</Label>
                                                                <Controller
                                                                    name={`invitedRoundMappings.${index}.endRound` as const}
                                                                    control={control}
                                                                    render={({ field: { value, onChange } }) => (
                                                                        <Select value={value?.toString() ?? ""} onValueChange={(v) => onChange(parseInt(v))}>
                                                                            <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-lg text-[10px] font-black uppercase text-gray-400 w-full">
                                                                                <SelectValue placeholder="Select" />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="bg-[#0f0f12] border-white/10">
                                                                                {fields.map((_, i) => (
                                                                                    <SelectItem key={i} value={i.toString()} className="text-[9px] font-black uppercase text-gray-400 focus:bg-rose-600 focus:text-white">
                                                                                        R{i + 1}: {watch(`invitedTeamsRoadmap.${i}.title`) || 'Unnamed'}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 flex-1 w-full mt-2 sm:mt-0">
                                                            <div className="hidden sm:flex flex-col items-center justify-center pt-5">
                                                                <div className="w-8 h-[2px] bg-white/10"></div>
                                                                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white/20 border-b-[4px] border-b-transparent"></div>
                                                            </div>

                                                            <div className="space-y-2 flex-1">
                                                                <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1 border-l-2 border-purple-500/50 pl-2 ml-1">Merges to Main Round</Label>
                                                                <Controller
                                                                    name={`invitedRoundMappings.${index}.targetMainRound` as const}
                                                                    control={control}
                                                                    render={({ field: { value, onChange } }) => (
                                                                        <Select value={value?.toString() ?? ""} onValueChange={(v) => onChange(parseInt(v))}>
                                                                            <SelectTrigger className="bg-white/5 border-purple-500/20 h-10 rounded-lg text-[10px] font-black uppercase text-purple-400 w-full">
                                                                                <SelectValue placeholder="Select Main Round" />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="bg-[#0f0f12] border-white/10">
                                                                                {mainRoadmapData.length > 0 ? mainRoadmapData.map((_, i) => (
                                                                                    <SelectItem key={i} value={i.toString()} className="text-[9px] font-black uppercase text-gray-400 focus:bg-purple-600 focus:text-white">
                                                                                        R{i + 1}: {watch(`roadmap.${i}.title`) || 'Unnamed'}
                                                                                    </SelectItem>
                                                                                )) : (
                                                                                    <SelectItem value="-1" disabled className="text-[9px] font-black uppercase text-gray-500">
                                                                                        No Main Rounds Added Yet
                                                                                    </SelectItem>
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeMapping(index)}
                                                                className="h-10 w-10 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors mt-[20px]"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {mappingFields.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">No mappings configured</p>
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    const hasInvalid = mappingFields.some((_, i) => {
                                                        const mapping = watch(`invitedRoundMappings.${i}`);
                                                        return mapping.startRound == null || mapping.endRound == null || mapping.targetMainRound == null || mapping.startRound > mapping.endRound;
                                                    });
                                                    if (hasInvalid) {
                                                        toast.error("Please ensure all mapping fields are selected and Start Round is before or equal to End Round");
                                                        return;
                                                    }
                                                    setIsMappingSaved(true);
                                                }}
                                                className="w-full bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-10 border border-white/10"
                                            >
                                                Save Mapping Changes
                                            </Button>
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
