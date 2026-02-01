import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamStatCardProps {
    title: string;
    value: string | number;
    change?: string;
    icon: LucideIcon;
    color: string;
}

const colorMap = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
};

export const TeamStatCard = React.memo(({ title, value, change, icon: Icon, color }: TeamStatCardProps) => {
    return (
        <div className="p-5 border bg-[#0F111A]/60 border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-[#121421]/80 transition-all duration-300 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-white">
                        {value}
                    </p>
                    {change && (
                        <p className={cn(
                            "text-xs font-medium",
                            change.startsWith("+") ? "text-emerald-400" : "text-gray-400"
                        )}>
                            {change}
                        </p>
                    )}
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5">
                    <Icon className={cn("w-6 h-6", colorMap[color as keyof typeof colorMap] || "text-purple-400")} />
                </div>
            </div>
        </div>
    );
});
