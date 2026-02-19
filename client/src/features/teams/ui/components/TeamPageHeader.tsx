import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamPageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: React.ReactNode;
    actions?: React.ReactNode;
    iconColorClass?: string;
    iconBgClass?: string;
    className?: string;
    borderClassName?: string;
}

export const TeamPageHeader = ({
    icon: Icon,
    title,
    subtitle,
    actions,
    iconColorClass = "text-purple-400",
    iconBgClass = "bg-purple-500/10",
    className,
    borderClassName = "border-white/10",
}: TeamPageHeaderProps) => {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-8 gap-4", borderClassName, className)}>
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn("p-2 rounded-lg shrink-0", iconBgClass, iconColorClass)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white tracking-tight truncate">{title}</h2>
                    <div className="text-xs text-gray-400 truncate">{subtitle}</div>
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 sm:ml-4 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    {actions}
                </div>
            )}
        </div>
    );
};
