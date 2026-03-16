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
import { TournamentFormValues } from "@/features/tournaments/lib";

interface LeagueConfigSectionProps {
    roadmapName: "roadmap" | "invitedTeamsRoadmap" | "t1SpecialRoadmap";
    fields: any[];
    accentColor?: "purple" | "indigo" | "rose" | "amber";
}

export const LeagueConfigSection = ({ 
    roadmapName, 
    fields, 
    accentColor = "purple" 
}: LeagueConfigSectionProps) => {
    const { watch, setValue } = useFormContext<TournamentFormValues>();
    
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

    const handleCreateLeague = () => {
        const roadmapData = watch(roadmapName) || [];
        const firstNonLeague = roadmapData.findIndex(r => !r.isLeague);
        const targetIdx = firstNonLeague >= 0 ? firstNonLeague : fields.length - 1;
        
        if (targetIdx >= 0) {
            setValue(`${roadmapName}.${targetIdx}.isLeague`, true);
            setValue(`${roadmapName}.${targetIdx}.leagueType`, "18-teams");
        }
    };

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
                {fields.map((field, index) => (
                    watch(`${roadmapName}.${index}.isLeague`) && (
                        <div key={field.id} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 animate-in slide-in-from-left-2">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className={`w-2 h-2 rounded-full ${styles.pulse} animate-pulse`} />
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        League Match Type
                                    </Label>
                                </div>

                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-[160px]">
                                        <Select
                                            value={index.toString()}
                                            onValueChange={(value) => {
                                                const newIdx = parseInt(value);
                                                setValue(`${roadmapName}.${index}.isLeague`, false);
                                                setValue(`${roadmapName}.${newIdx}.isLeague`, true);
                                                setValue(`${roadmapName}.${newIdx}.leagueType`, "18-teams");
                                            }}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 h-8 rounded-lg text-[9px] font-black uppercase text-gray-400">
                                                <SelectValue placeholder="Select Round" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0f0f12] border-white/10">
                                                {fields.map((_, idx) => (
                                                    <SelectItem
                                                        key={idx}
                                                        value={idx.toString()}
                                                        className={`text-[9px] font-black uppercase text-gray-400 ${styles.selectFocus} focus:text-white`}
                                                    >
                                                        {watch(`${roadmapName}.${idx}.title`) ? `R${idx + 1}: ${watch(`${roadmapName}.${idx}.title`)}` : `Round ${idx + 1}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                        <Checkbox
                                            id={`footer-18-teams-${roadmapName}-${index}`}
                                            checked={watch(`${roadmapName}.${index}.leagueType`) === "18-teams"}
                                            onCheckedChange={(checked) => setValue(`${roadmapName}.${index}.leagueType`, checked ? "18-teams" : "12-teams")}
                                            className={`border-white/20 ${styles.checkbox} w-3 h-3`}
                                        />
                                        <Label htmlFor={`footer-18-teams-${roadmapName}-${index}`} className="text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                            18 Teams
                                        </Label>
                                    </div>

                                    {watch(`${roadmapName}.${index}.leagueType`) === "18-teams" && (
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
                                        onClick={() => setValue(`${roadmapName}.${index}.isLeague`, false)}
                                        className="h-8 w-8 ml-auto text-gray-500 hover:text-rose-500 hover:bg-rose-500/10"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};
