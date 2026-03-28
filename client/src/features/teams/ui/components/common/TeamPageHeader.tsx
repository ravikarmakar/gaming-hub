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
  badgeText?: string | number;
  badgeIcon?: LucideIcon;
  badgeColor?: string;
  className?: string;
  borderClassName?: string;
  noMargin?: boolean;
  noPadding?: boolean;
  compact?: boolean;
}

export const TeamPageHeader = ({
  icon: Icon,
  title,
  subtitle,
  actions,
  iconColorClass = "text-purple-400",
  iconBgClass = "bg-purple-500/10",
  badgeText,
  badgeIcon: BadgeIcon,
  badgeColor,
  className,
  borderClassName = "border-white/10",
  noMargin,
  noPadding,
  compact,
}: TeamPageHeaderProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between border-b gap-4",
      !noPadding && "pb-4",
      !noPadding && (compact ? "px-4 py-2 pt-3" : "px-4 md:px-6 pt-4 md:pt-6"),
      !noMargin && (compact ? "mb-2" : "mb-6 sm:mb-8"),
      borderClassName, 
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(compact ? "p-1.5" : "p-2", "rounded-lg shrink-0", iconBgClass, iconColorClass)}>
          <Icon className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className={cn(compact ? "text-lg" : "text-xl sm:text-2xl", "font-black text-white tracking-tight truncate")}>{title}</h2>
            {(badgeText !== undefined && badgeText !== null) && (
              <div className={cn(
                "px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border flex items-center gap-1.5 shrink-0 transition-all shadow-sm",
                badgeColor || "bg-purple-500/10 border-purple-500/20 text-purple-400"
              )}>
                {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                <span className="leading-none">{badgeText}</span>
              </div>
            )}
          </div>
          {!compact && <div className="text-[11px] sm:text-sm text-gray-500 truncate font-medium">{subtitle}</div>}
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
