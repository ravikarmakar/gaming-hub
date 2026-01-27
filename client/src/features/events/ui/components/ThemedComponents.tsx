import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    gradient = false,
    ...props
}) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/5 bg-[#0B0C1A]/40 backdrop-blur-xl transition-all duration-300 hover:border-white/10",
                gradient && "after:absolute after:inset-0 after:bg-gradient-to-br after:from-purple-500/5 after:to-transparent after:pointer-events-none",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

interface MetricCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color?: string;
    trend?: string;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    icon: Icon,
    title,
    value,
    color = "text-purple-400",
    trend,
    className
}) => {
    return (
        <GlassCard className={cn("p-6 group", className)}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5 transition-transform group-hover:scale-110 duration-300", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black text-white tracking-tight">{value}</p>
            </div>
        </GlassCard>
    );
};

interface NeonBadgeProps {
    children: React.ReactNode;
    variant?: "purple" | "blue" | "green" | "red" | "orange";
    className?: string;
}

export const NeonBadge: React.FC<NeonBadgeProps> = ({
    children,
    variant = "purple",
    className
}) => {
    const variants = {
        purple: "text-purple-300 bg-purple-500/20 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
        blue: "text-blue-300 bg-blue-500/20 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
        green: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
        red: "text-rose-300 bg-rose-500/20 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
        orange: "text-orange-300 bg-orange-500/20 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]",
    };

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export const SectionHeader: React.FC<{ title: string; icon?: React.ElementType; action?: React.ReactNode }> = ({
    title,
    icon: Icon,
    action
}) => (
    <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            {Icon && <Icon className="text-purple-500 w-6 h-6" />}
            {title}
        </h2>
        {action}
    </div>
);
