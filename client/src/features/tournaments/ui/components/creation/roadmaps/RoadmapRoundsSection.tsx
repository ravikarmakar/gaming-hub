import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RoadmapDisplaySection } from "./RoadmapDisplaySection";
import { cn } from "@/lib/utils";

interface RoadmapRoundsSectionProps {
    title?: string;
    description: string;
    isRoundsConfirmed: boolean;
    roadmapData: any[];
    fields: any[];
    fieldNamePrefix: string;
    register: any;
    onAddRound: () => void;
    onRemoveRound: (index: number) => void;
    onToggleConfirmed?: () => void;
    isSavingDisabled?: boolean;
    accentColor?: "purple" | "indigo" | "amber" | "rose";
}

export const RoadmapRoundsSection: React.FC<RoadmapRoundsSectionProps> = ({
    title = "Rounds Breakdown",
    description,
    isRoundsConfirmed,
    roadmapData,
    fields,
    fieldNamePrefix,
    register,
    onAddRound,
    onRemoveRound,
    onToggleConfirmed,
    isSavingDisabled = false,
    accentColor = "purple"
}) => {
    const accentText = accentColor === "amber"
        ? "text-amber-400"
        : accentColor === "purple"
            ? "text-purple-400"
            : accentColor === "indigo"
                ? "text-indigo-400"
                : "text-rose-400";

    const accentBg = accentColor === "amber"
        ? "bg-amber-500/10"
        : accentColor === "purple"
            ? "bg-purple-500/10"
            : accentColor === "indigo"
                ? "bg-indigo-500/10"
                : "bg-rose-500/10";

    const accentBorder = accentColor === "amber"
        ? "border-amber-500/20"
        : accentColor === "purple"
            ? "border-purple-500/20"
            : accentColor === "indigo"
                ? "border-indigo-500/20"
                : "border-rose-500/20";

    const focusBorder = accentColor === "amber"
        ? "focus:border-amber-500/50"
        : accentColor === "purple"
            ? "focus:border-purple-500/50"
            : accentColor === "indigo"
                ? "focus:border-indigo-500/50"
                : "focus:border-rose-500/50";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{title}</h3>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">{description}</p>
                </div>
                <div className="flex items-center gap-3">
                    {onToggleConfirmed && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onToggleConfirmed}
                            disabled={isSavingDisabled}
                            className={cn(
                                "h-7 px-4 text-[9px] font-black tracking-widest uppercase transition-all rounded-lg border",
                                isRoundsConfirmed
                                    ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                                    : cn(accentBg, accentBorder, accentText, "hover:bg-white/10")
                            )}
                        >
                            {isRoundsConfirmed ? "CONFIGURED" : "SAVE CHANGE"}
                        </Button>
                    )}
                    {!isRoundsConfirmed && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onAddRound}
                            className={cn(
                                "h-7 px-3 text-[9px] font-black tracking-widest uppercase transition-all rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white flex items-center gap-1.5",
                                accentText
                            )}
                        >
                            <Plus size={12} /> ADD ROUND
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {!isRoundsConfirmed && fields.length > 0 && (
                    <div className="grid grid-cols-[100px_1fr_40px] gap-4 px-4 py-1">
                        <Label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Round Number</Label>
                        <Label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Round Name (e.g. Qualifiers)</Label>
                        <span></span>
                    </div>
                )}

                {isRoundsConfirmed ? (
                    <RoadmapDisplaySection
                        rounds={roadmapData}
                        accentColor={accentColor}
                    />
                ) : (
                    fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[100px_1fr_40px] gap-4 items-center bg-white/[0.03] hover:bg-white/[0.05] p-1.5 px-4 rounded-xl border border-white/5 transition-all">
                            <Input
                                {...register(`${fieldNamePrefix}.${index}.name`)}
                                readOnly
                                className="bg-white/5 border-transparent h-8 rounded-lg text-[10px] font-bold cursor-not-allowed text-gray-500 text-center"
                            />
                            <Input
                                {...register(`${fieldNamePrefix}.${index}.title`)}
                                placeholder="Enter round name..."
                                className={cn(
                                    "bg-transparent border-white/5 h-8 rounded-lg text-[10px] font-semibold flex-1 transition-colors",
                                    focusBorder
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveRound(index)}
                                className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))
                )}

                {!isRoundsConfirmed && fields.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                        <p className="text-xs font-bold text-gray-500">No rounds added yet</p>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onAddRound}
                            className={cn("mt-2 text-[10px] font-black hover:text-white px-4 h-8", accentText)}
                        >
                            + Add First Round
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
