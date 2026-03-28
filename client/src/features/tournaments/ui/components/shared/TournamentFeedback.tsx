import React from "react";
import { Loader2, SearchX, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ThemedComponents";

interface TournamentLoadingProps {
    variant?: "fullscreen" | "component" | "inline";
    text?: string;
    className?: string;
}

/**
 * Reusable Loading state for Tournaments
 */
export const TournamentLoading: React.FC<TournamentLoadingProps> = ({
    variant = "component",
    text = "Accessing Arena Protocol...",
    className
}) => {
    if (variant === "inline") {
        return (
            <div className={cn("py-4 flex justify-center items-center gap-2", className)}>
                <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{text}</span>
            </div>
        );
    }

    const isFullscreen = variant === "fullscreen";

    return (
        <div className={cn(
            "flex items-center justify-center p-8",
            isFullscreen ? "min-h-screen bg-brand-black w-full fixed inset-0 z-50" : "min-h-[400px] w-full",
            className
        )}>
            <div className="text-center space-y-6">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className={cn(
                        "relative z-10 mx-auto text-purple-500 animate-spin",
                        isFullscreen ? "w-16 h-16" : "w-12 h-12"
                    )} />
                </div>
                <div>
                    <p className={cn(
                        "text-gray-400 font-black uppercase tracking-[0.2em] font-mono",
                        isFullscreen ? "text-sm animate-pulse" : "text-xs"
                    )}>
                        {text}
                    </p>
                    {isFullscreen && (
                        <div className="mt-4 w-48 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface TournamentEmptyProps {
    message: string;
    subMessage?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    className?: string;
    fullHeight?: boolean;
}

/**
 * Reusable Empty state for Tournaments
 */
export const TournamentEmpty: React.FC<TournamentEmptyProps> = ({
    message,
    subMessage,
    icon: Icon = SearchX,
    action,
    className,
    fullHeight = true
}) => {
    return (
        <GlassCard className={cn(
            "flex flex-col items-center justify-center py-20 px-8 text-center bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group",
            fullHeight ? "min-h-[400px]" : "min-h-[300px]",
            className
        )}>
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative">
                {/* Icon Container */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-transparent border border-white/10 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-all duration-500">
                        <Icon className="w-10 h-10 text-gray-500 group-hover:text-purple-400/60 transition-colors" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-xl bg-purple-600 border border-white/20 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-purple-600/40 opacity-0 group-hover:opacity-100">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                        {message}
                    </h3>
                    {subMessage && (
                        <p className="text-gray-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                            {subMessage}
                        </p>
                    )}
                    {action && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="pt-6 flex justify-center"
                        >
                            {action}
                        </motion.div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};
