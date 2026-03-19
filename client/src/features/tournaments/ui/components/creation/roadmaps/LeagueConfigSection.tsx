import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Trash2, Trophy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { TournamentFormValues } from "@/features/tournaments/lib/tournamentSchema";
import { cn } from "@/lib/utils";

interface LeagueConfigSectionProps {
    roadmapName: "roadmap" | "invitedTeamsRoadmap" | "t1SpecialRoadmap";
    fields: any[];
    accentColor?: "purple" | "indigo" | "rose" | "amber";
}

export const LeagueConfigSection = ({
    roadmapName,
    accentColor = "purple"
}: LeagueConfigSectionProps) => {
    const { watch, setValue } = useFormContext<TournamentFormValues>();
    const roadmapValues = watch(roadmapName) || [];

    const [isSectionOpen, setIsSectionOpen] = useState(() => {
        return (roadmapValues as any[]).some((r: any) => r.isLeague);
    });

    const handleCreateLeague = () => {
        setIsSectionOpen(true);
        // Find first round that is NOT a league and make it one
        const indexToMakeLeague = (roadmapValues as any[]).findIndex((r: any) => !r.isLeague);
        if (indexToMakeLeague === -1) {
            // Already all are leagues, nothing more to do but show the section
            return;
        }

        setValue(`${roadmapName}.${indexToMakeLeague}.isLeague`, true);
        setValue(`${roadmapName}.${indexToMakeLeague}.leagueType`, undefined);
    };

    const colorStyles = {
        purple: {
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            text: "text-purple-400",
            checkbox: "data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500",
            trophy: "text-purple-400",
            pulse: "bg-purple-500",
            selectFocus: "focus:bg-purple-600"
        },
        indigo: {
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
            text: "text-indigo-400",
            checkbox: "data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500",
            trophy: "text-indigo-400",
            pulse: "bg-indigo-500",
            selectFocus: "focus:bg-indigo-600"
        },
        rose: {
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            text: "text-rose-400",
            checkbox: "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500",
            trophy: "text-rose-400",
            pulse: "bg-rose-500",
            selectFocus: "focus:bg-rose-600"
        },
        amber: {
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            text: "text-amber-400",
            checkbox: "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500",
            trophy: "text-amber-500",
            pulse: "bg-amber-500",
            selectFocus: "focus:bg-amber-600"
        }
    };

    const styles = colorStyles[accentColor];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${styles.bg} rounded-lg`}>
                        <Trophy size={18} className={styles.trophy} />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-black text-white uppercase tracking-tight">Configuration</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Finalize the rules for each stage</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCreateLeague}
                    className={`ml-auto ${styles.bg} ${styles.border} ${styles.text} hover:bg-white/10 hover:text-white text-[10px] font-black uppercase tracking-widest h-8 px-4 rounded-xl`}
                >
                    + Create League
                </Button>
            </div>

            <div className="space-y-4">
                {isSectionOpen && (roadmapValues as any[]).map((round, index) => {
                    if (!round.isLeague) return null;

                    const leagueType = round.leagueType;
                    const is18Teams = leagueType === "18-teams";

                    return (
                        <div key={`${roadmapName}-${index}`} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 animate-in slide-in-from-left-2 mb-4">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className={`w-2 h-2 rounded-full ${styles.pulse} ${is18Teams ? "animate-pulse" : "opacity-30"}`} />
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        League Match Type
                                    </Label>
                                </div>

                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-[160px]">
                                        <Select
                                            disabled={!is18Teams}
                                            value={index.toString()}
                                            onValueChange={(value) => {
                                                const newIdx = parseInt(value);
                                                if (newIdx === index) return;

                                                // Check if target round is already a league
                                                if ((roadmapValues as any[])[newIdx].isLeague) {
                                                    return; // Prevent merging or multiple leagues on same round if not intended
                                                }

                                                // Move config from current index to new index
                                                setValue(`${roadmapName}.${newIdx}.isLeague`, true);
                                                setValue(`${roadmapName}.${newIdx}.leagueType`, round.leagueType);

                                                setValue(`${roadmapName}.${index}.isLeague`, false);
                                                setValue(`${roadmapName}.${index}.leagueType`, undefined);
                                            }}
                                        >
                                            <SelectTrigger className={cn(
                                                "bg-white/5 border-white/10 h-8 rounded-lg text-[9px] font-black uppercase text-gray-400",
                                                !is18Teams && "opacity-50 grayscale"
                                            )}>
                                                <SelectValue placeholder="Select Round" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0f0f12] border-white/10">
                                                {(roadmapValues as any[]).map((r, idx) => (
                                                    <SelectItem
                                                        key={idx}
                                                        value={idx.toString()}
                                                        disabled={r.isLeague && idx !== index}
                                                        className={`text-[9px] font-black uppercase text-gray-400 ${styles.selectFocus} focus:text-white`}
                                                    >
                                                        {r.title ? `R${idx + 1}: ${r.title}` : `Round ${idx + 1}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                        <Checkbox
                                            id={`footer-18-teams-${roadmapName}-${index}`}
                                            checked={is18Teams}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue(`${roadmapName}.${index}.leagueType`, "18-teams");
                                                    setValue(`${roadmapName}.${index}.isLeague`, true);
                                                } else {
                                                    setValue(`${roadmapName}.${index}.leagueType`, undefined);
                                                    // Note: We keep isLeague: true so the card stays visible, 
                                                    // matches user requirement that it's "not selected as a league" yet.
                                                }
                                            }}
                                            className={`border-white/20 ${styles.checkbox} w-3 h-3`}
                                        />
                                        <Label htmlFor={`footer-18-teams-${roadmapName}-${index}`} className="text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            18 Teams
                                        </Label>
                                    </div>

                                    {is18Teams && (
                                        <div className={`flex items-center gap-2 ${styles.bg} px-3 py-1.5 rounded-lg border ${styles.border}`}>
                                            <Trophy size={14} className={styles.trophy} />
                                            <span className={`text-[10px] font-black ${styles.text} uppercase tracking-widest`}>
                                                Active
                                            </span>
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setValue(`${roadmapName}.${index}.isLeague`, false);
                                            setValue(`${roadmapName}.${index}.leagueType`, undefined);

                                            // Close section if no leagues left
                                            const remainingLeagues = (watch(roadmapName) as any[]).filter(r => r.isLeague).length;
                                            if (remainingLeagues <= 1) { // Current one is still in watch result until state sync
                                                // Actually watch is reactive, but let's be safe
                                                setTimeout(() => {
                                                    const latestLeagues = (watch(roadmapName) as any[]).filter(r => r.isLeague).length;
                                                    if (latestLeagues === 0) setIsSectionOpen(false);
                                                }, 0);
                                            }
                                        }}
                                        className="h-8 w-8 ml-auto text-gray-500 hover:text-rose-500 hover:bg-rose-500/10"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

