import React from "react";
import { CheckCircle2, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoadmapHeaderProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
    isRoundsConfirmed: boolean;
    onToggleSave: () => void;
    onAddRound?: () => void;
    isSavingDisabled: boolean;
    accentColor?: "amber" | "purple" | "indigo";
    className?: string;
}

export const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({
    title,
    description,
    icon: Icon = ListTodo,
    isRoundsConfirmed,
    onToggleSave,
    onAddRound,
    isSavingDisabled,
    accentColor = "amber",
    className
}) => {
    const buttonStyles = isRoundsConfirmed
        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
        : isSavingDisabled
            ? "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-50"
            : accentColor === "amber"
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40"
                : accentColor === "purple"
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40";

    const accentTextColor = accentColor === "amber"
        ? "text-amber-500"
        : accentColor === "purple"
            ? "text-purple-500"
            : "text-indigo-500";

    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
            <div className="flex items-start gap-4">
                <div className={cn("p-2.5 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 mt-0.5", accentTextColor)}>
                    <Icon size={20} />
                </div>
                <div className="space-y-0.5">
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">

                {onAddRound && !isRoundsConfirmed && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onAddRound}
                        className={cn(
                            "h-8 px-4 text-[9px] font-black tracking-widest uppercase transition-all rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white",
                            accentColor === "amber" ? "text-amber-400" : accentColor === "purple" ? "text-purple-400" : "text-indigo-400"
                        )}
                    >
                        <Plus size={12} className="mr-1.5" /> ADD ROUND
                    </Button>
                )}

                <Button
                    type="button"
                    onClick={onToggleSave}
                    disabled={isSavingDisabled}
                    className={cn(
                        "h-8 px-5 text-[9px] font-black tracking-widest uppercase transition-all rounded-lg",
                        buttonStyles
                    )}
                >
                    {isRoundsConfirmed ? (
                        <span className="flex items-center gap-2"><CheckCircle2 size={12} /> Roadmap Edit</span>
                    ) : (
                        "Save Roadmap"
                    )}
                </Button>
            </div>
        </div>
    );
};
