import React from "react";
import { SearchX } from "lucide-react";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";

export interface EmptyStateProps {
    message: string;
    subMessage?: string;
    action?: React.ReactNode;
}

export const EmptyState = ({
    message,
    subMessage,
    action,
}: EmptyStateProps) => (
    <GlassCard className="flex flex-col items-center justify-center min-h-[400px] py-24 px-6 text-center bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-8 border border-white/10 group-hover:border-violet-500/30 transition-colors duration-500 rotate-12 group-hover:rotate-0">
                <SearchX className="w-10 h-10 text-violet-400/60 group-hover:text-violet-400 transition-colors duration-500" />
            </div>
            <div className="space-y-3">
                <h3 className="text-2xl font-black italic tracking-tighter text-white/90 group-hover:text-white transition-colors">
                    {message}
                </h3>
                {subMessage && (
                    <p className="text-white/40 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                        {subMessage}
                    </p>
                )}
                {action && (
                    <div className="pt-4 flex justify-center">
                        {action}
                    </div>
                )}
            </div>
        </div>
    </GlassCard>
);