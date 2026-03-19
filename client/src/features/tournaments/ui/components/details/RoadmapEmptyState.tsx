import React from 'react';
import { Map, Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoadmapEmptyStateProps {
    showCTA?: boolean;
    onInitialize?: () => void;
}

export const RoadmapEmptyState: React.FC<RoadmapEmptyStateProps> = ({ showCTA, onInitialize }) => {
    return (
        <div className="relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-rose-600/5 opacity-50" />
            
            <div className="relative flex flex-col items-center justify-center p-12 sm:p-20 text-center bg-transparent">
                {/* Decorative Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
                
                {/* Icon Stack */}
                <div className="relative mb-8">
                    <div className="h-20 w-20 rounded-3xl bg-transparent border border-white/10 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Map className="w-10 h-10 text-gray-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-xl bg-purple-600 border border-white/20 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-purple-600/40">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                </div>

                <h4 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">
                    Arena Roadmap <span className="text-purple-500">Pending</span>
                </h4>
                <p className="text-gray-400 max-w-sm mb-10 leading-relaxed font-medium">
                    The mission path has not been forged yet. Define the rounds and stages to guide players through the competition.
                </p>

                {showCTA ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Button
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30 shadow-[0_10px_25px_-5px_rgba(147,51,234,0.4)] transition-all font-black tracking-[0.1em] uppercase text-[10px] px-8 py-6 h-auto rounded-2xl group/btn"
                            onClick={onInitialize}
                        >
                            <Plus className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-90" />
                            Initialize Roadmap
                        </Button>
                    </div>
                ) : (
                    <Badge variant="outline" className="border-white/10 text-gray-500 bg-white/5 px-6 py-2 rounded-full font-bold tracking-widest uppercase text-[9px]">
                        Awaiting Organizer Setup
                    </Badge>
                )}
            </div>
        </div>
    );
};
