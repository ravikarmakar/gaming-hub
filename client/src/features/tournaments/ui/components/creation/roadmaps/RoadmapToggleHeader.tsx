import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface RoadmapToggleHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    accentColor?: "amber" | "purple" | "indigo";
    isEmbedded?: boolean;
}

export const RoadmapToggleHeader: React.FC<RoadmapToggleHeaderProps> = ({
    title,
    description,
    icon: Icon,
    id,
    checked,
    onCheckedChange,
    accentColor = "amber",
    isEmbedded = false
}) => {
    const accentBorder = accentColor === "amber"
        ? "border-amber-500/20 bg-amber-500/5"
        : accentColor === "purple"
            ? "border-purple-500/20 bg-purple-500/5"
            : "border-indigo-500/20 bg-indigo-500/5";

    const accentBg = accentColor === "amber"
        ? "bg-amber-500/10"
        : accentColor === "purple"
            ? "bg-purple-500/10"
            : "bg-indigo-500/10";

    const accentText = accentColor === "amber"
        ? "text-amber-400"
        : accentColor === "purple"
            ? "text-purple-400"
            : "text-indigo-400";

    const accentCheckbox = accentColor === "amber"
        ? "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
        : accentColor === "purple"
            ? "data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            : "data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500";

    if (isEmbedded) return null;

    return (
        <GlassCard className={cn("p-6", accentBorder)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", accentBg)}>
                        <Icon size={18} className={accentText} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{title}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                    <Label htmlFor={id} className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                        {checked ? "YES, ENABLE" : "NO, SKIP"}
                    </Label>
                    <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={(checked) => onCheckedChange(!!checked)}
                        className={cn("border-white/20 rounded-md", accentCheckbox)}
                    />
                </div>
            </div>
        </GlassCard>
    );
};
