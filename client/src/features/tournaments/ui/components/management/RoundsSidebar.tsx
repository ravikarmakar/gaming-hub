import React from 'react';
import { Loader2 } from "lucide-react";
import { RoundsSidebarHeader } from "./rounds/RoundsSidebarHeader";
import { RoundItem } from "./rounds/RoundItem";
import { Round, RoundTabType } from "@/features/tournaments/types";

interface RoundsSidebarProps {
    isLoading: boolean;
    event: any;
    rounds: Round[];
    filteredSidebarItems: Round[];
    selectedRoundId: string | null;
    setSelectedRoundId: (id: string) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    activeRoundTab: RoundTabType;
    setActionRound: (round: Round) => void;
    setIsEditRoundOpen: (open: boolean) => void;
    setIsResetRoundOpen: (open: boolean) => void;
}

export const RoundsSidebar: React.FC<RoundsSidebarProps> = ({
    isLoading,
    event,
    rounds,
    filteredSidebarItems,
    selectedRoundId,
    setSelectedRoundId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    activeRoundTab,
    setActionRound,
    setIsEditRoundOpen,
    setIsResetRoundOpen,
}) => {
    return (
        <div
            className={`${isSidebarCollapsed ? "w-20" : "w-80 md:w-96"
                } border-r border-white/5 bg-black/10 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col`}
        >
            <RoundsSidebarHeader
                activeRoundTab={activeRoundTab}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleCollapse={setIsSidebarCollapsed}
            />

            <div className="space-y-2 px-4 pt-4 flex-1 overflow-y-auto custom-scrollbar">
                {(isLoading || !event) && rounds.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        {isSidebarCollapsed ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Loading..."}
                    </div>
                ) : filteredSidebarItems.map((round) => (
                    <RoundItem
                        key={round._id}
                        round={round}
                        activeRoundTab={activeRoundTab}
                        isSelected={selectedRoundId === round._id}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onSelect={setSelectedRoundId}
                        onEditClick={(r) => {
                            setActionRound(r);
                            setIsEditRoundOpen(true);
                        }}
                        onDeleteClick={(r) => {
                            setActionRound(r);
                            setIsResetRoundOpen(true);
                        }}
                    />
                ))}
                {!isLoading && event && filteredSidebarItems.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-8">
                        {isSidebarCollapsed ? "Empty" : `No ${activeRoundTab === 'invited-tournament' ? 'invited' : 'main'} rounds found.`}
                    </div>
                )}
            </div>
        </div>
    );
};
