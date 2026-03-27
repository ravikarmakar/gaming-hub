import React from 'react';
import { RoundsSidebarHeader } from "./RoundsSidebarHeader";
import { RoundItem } from "./RoundItem";
import { Round } from "@/features/tournaments/types";
import { useTournamentDashboard } from '@/features/tournaments/context/TournamentDashboardContext';
import { useRoundsContext } from '@/features/tournaments/context/TournamentRoundsContext';
import { TournamentLoading, TournamentEmpty } from '../../shared/TournamentFeedback';

export const RoundsSidebar: React.FC = () => {
    const {
        selectedRoundId,
        setSelectedRoundId,
        activeRoundTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
    } = useTournamentDashboard();

    const {
        isLoading,
        event,
        rounds,
        filteredSidebarItems,
    } = useRoundsContext();

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

            <div className="space-y-2 px-4 pt-4 flex-1 overflow-y-auto scrollbar-hide">
                {(isLoading || !event) && rounds.length === 0 ? (
                    <TournamentLoading 
                        variant="inline" 
                        text={isSidebarCollapsed ? "" : "Loading Rounds..."} 
                        className={isSidebarCollapsed ? "py-8" : ""}
                    />
                ) : filteredSidebarItems.map((round: Round) => (
                    <RoundItem
                        key={round._id}
                        round={round}
                        isSelected={selectedRoundId === round._id}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onSelect={setSelectedRoundId}
                    />
                ))}
                {!isLoading && event && filteredSidebarItems.length === 0 && (
                    <TournamentEmpty 
                        message={isSidebarCollapsed ? "" : "Empty"}
                        subMessage={isSidebarCollapsed ? "" : `No ${activeRoundTab === 'invited-tournament' ? 'invited' : 'main'} rounds found.`}
                        fullHeight={false}
                        className="py-10 bg-transparent border-none shadow-none"
                    />
                )}
            </div>
        </div>
    );
};
