import { useFormContext, useFieldArray } from "react-hook-form";
import { Edit3, Check, Map } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { TournamentFormValues } from "@/features/tournaments/lib";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface MergeConfigSectionProps {
    mappingName: "invitedRoundMappings" | "t1SpecialRoundMappings";
    sourceRoadmapName: "invitedTeamsRoadmap" | "t1SpecialRoadmap";
    targetRoadmapName?: "roadmap";
    isMappingSaved: boolean;
    setIsMappingSaved: (saved: boolean) => void;
    accentColor?: "rose" | "amber" | "purple" | "indigo";
    sourceLabel?: string;
}

export const MergeConfigSection = ({
    mappingName,
    sourceRoadmapName,
    targetRoadmapName = "roadmap",
    isMappingSaved,
    setIsMappingSaved,
    accentColor = "rose",
    sourceLabel = "Roadmap"
}: MergeConfigSectionProps) => {
    const { watch, setValue, control } = useFormContext<TournamentFormValues>();
    const { append: appendMapping } = useFieldArray({
        control,
        name: mappingName
    });

    const sourceFields = watch(sourceRoadmapName) || [];
    const targetFields = watch(targetRoadmapName) || [];
    const currentMappings = watch(mappingName) || [];

    const colorStyles = {
        rose: {
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            text: "text-rose-400",
            icon: "text-rose-400",
            bgLight: "bg-rose-500/5",
            selectFocus: "focus:bg-rose-600"
        },
        amber: {
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            text: "text-amber-400",
            icon: "text-amber-400",
            bgLight: "bg-amber-500/5",
            selectFocus: "focus:bg-amber-600"
        },
        purple: {
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            text: "text-purple-400",
            icon: "text-purple-400",
            bgLight: "bg-purple-500/5",
            selectFocus: "focus:bg-purple-600"
        },
        indigo: {
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
            text: "text-indigo-400",
            icon: "text-indigo-400",
            bgLight: "bg-indigo-500/5",
            selectFocus: "focus:bg-indigo-600"
        }
    };

    const styles = colorStyles[accentColor];

    const handleSaveToggle = () => {
        if (!isMappingSaved) {
            if (!currentMappings || currentMappings.length === 0 || currentMappings[0].targetMainRound?.roundNumber === undefined) {
                toast.error("Please select a target main round");
                return;
            }
            setIsMappingSaved(true);
        } else {
            setIsMappingSaved(false);
        }
    };

    return (
        <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 mt-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${styles.bg} rounded-lg`}>
                        <Map size={16} className={styles.icon} />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-black text-white uppercase tracking-tight">Merge Configuration</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Select the main tournament round where this roadmap joins</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSaveToggle}
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
                        {currentMappings && currentMappings.length > 0 ? (
                            <div className={`flex items-center gap-3 py-2 px-4 ${styles.bgLight} rounded-lg border border-transparent hover:border-white/5 transition-all group`}>
                                <div className="flex items-center gap-2">
                                    <Map size={12} className={styles.icon} />
                                    <span className={`text-[10px] font-black ${styles.text} uppercase tracking-widest`}>Merge Rule</span>
                                    <span className="text-gray-700 font-bold">→</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 flex-wrap">
                                    <span>{sourceLabel}</span>
                                    <span className={styles.text}>
                                        ({currentMappings[0]?.sourceRound?.roundName || (sourceFields.length > 0 ? (watch(`${sourceRoadmapName}.${sourceFields.length - 1}.title`) || `Round ${sourceFields.length}`) : "No Rounds")})
                                    </span>
                                    {currentMappings[0]?.sourceRound?.roundNumber !== undefined && currentMappings[0].sourceRound.roundNumber !== sourceFields.length && (
                                        <span className="text-amber-500 text-[9px] font-black uppercase ring-1 ring-amber-500/20 px-1.5 py-0.5 rounded bg-amber-500/10">Outdated</span>
                                    )}
                                    <span className="text-gray-600 font-medium">Merges to</span>
                                    <span>Main Roadmap</span>
                                    <span className="text-purple-400">
                                        ({currentMappings[0]?.targetMainRound?.roundNumber !== undefined ? (watch(`${targetRoadmapName}.${currentMappings[0].targetMainRound.roundNumber - 1}.title`) || `Round ${currentMappings[0].targetMainRound.roundNumber}`) : "Not Mapped"})
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
                                    <Label className={`text-[9px] font-black text-gray-400 uppercase tracking-widest border-l-2 ${accentColor === 'rose' ? 'border-rose-500/50' : accentColor === 'amber' ? 'border-amber-500/50' : accentColor === 'purple' ? 'border-purple-500/50' : 'border-indigo-500/50'} pl-2`}>Merge Point</Label>
                                    <p className="text-[8px] text-gray-600 font-bold uppercase pl-2">Last round of this roadmap</p>
                                </div>
                                <div className="w-[180px]">
                                    <Select
                                        value={currentMappings && currentMappings[0]?.targetMainRound?.roundNumber !== undefined ? (currentMappings[0].targetMainRound.roundNumber - 1).toString() : ""}
                                        onValueChange={(v) => {
                                            const val = parseInt(v);
                                            const lastRoundIdx = Math.max(0, sourceFields.length - 1);
                                            const sourceRound = {
                                                roundNumber: lastRoundIdx + 1,
                                                roundName: watch(`${sourceRoadmapName}.${lastRoundIdx}.title`) || `Round ${lastRoundIdx + 1}`
                                            };
                                            const targetMainRound = {
                                                roundNumber: val + 1,
                                                roundName: watch(`${targetRoadmapName}.${val}.title`) || `Round ${val + 1}`
                                            };

                                            if (!currentMappings || currentMappings.length === 0) {
                                                appendMapping({ sourceRound, targetMainRound });
                                            } else {
                                                setValue(`${mappingName}.0.targetMainRound`, targetMainRound);
                                                setValue(`${mappingName}.0.sourceRound`, sourceRound);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className={`bg-white/5 ${accentColor === 'rose' ? 'border-rose-500/20 text-rose-400' : accentColor === 'amber' ? 'border-amber-500/20 text-amber-400' : accentColor === 'purple' ? 'border-purple-500/20 text-purple-400' : 'border-indigo-500/20 text-indigo-400'} h-8 rounded-lg text-[9px] font-black uppercase`}>
                                            <SelectValue placeholder="Select Main Round" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0f0f12] border-white/10">
                                            {targetFields.length > 0 ? targetFields.map((_, i) => (
                                                <SelectItem key={i} value={i.toString()} className={`text-[9px] font-black uppercase text-gray-400 ${styles.selectFocus} focus:text-white`}>
                                                    R{i + 1}: {watch(`${targetRoadmapName}.${i}.title`) || 'Unnamed'}
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
    );
};
