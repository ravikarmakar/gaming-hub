import React from 'react';
import { Map, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TournamentEmpty } from "../shared/TournamentFeedback";

interface RoadmapEmptyStateProps {
    showCTA?: boolean;
    onInitialize?: () => void;
}

export const RoadmapEmptyState: React.FC<RoadmapEmptyStateProps> = ({ showCTA, onInitialize }) => {
    return (
        <TournamentEmpty 
            message="Arena Roadmap Pending"
            subMessage="The mission path has not been forged yet. Define the rounds and stages to guide players through the competition."
            icon={Map}
            action={showCTA ? (
                <Button
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30 shadow-[0_10px_25px_-5px_rgba(147,51,234,0.4)] transition-all font-black tracking-[0.1em] uppercase text-[10px] px-8 py-6 h-auto rounded-2xl group/btn"
                    onClick={onInitialize}
                >
                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-90" />
                    Initialize Roadmap
                </Button>
            ) : undefined}
        />
    );
};
