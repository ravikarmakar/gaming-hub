import { PanelTopOpen, PanelTopClose, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoadmapTabs } from "../details/RoadmapTabs";
import { RoundsSidebar } from "./rounds/RoundsSidebar";
import { RoundHeader } from "./rounds/RoundHeader";
import { GroupsGrid } from "./groups/GroupsGrid";
import { useTournamentDashboard } from "@/features/tournaments/context/TournamentDashboardContext";
import { useRoundsContext } from "@/features/tournaments/context/TournamentRoundsContext";
import { TournamentEmpty } from "../shared/TournamentFeedback";

export const RoundsManager = () => {
    const {
        isFocusMode,
        setIsFocusMode,
        activeRoundTab,
        setActiveRoundTab,
    } = useTournamentDashboard();

    const { selectedRound, event } = useRoundsContext();

    const toggleFocus = () => setIsFocusMode((prev: boolean) => !prev);

    // Derived flags for the placeholder state
    const isMainRoadmap = activeRoundTab === 'tournament';
    const hasMappings = event?.hasMappings;

    return (
        <div className="flex flex-col h-full w-full">
            <div className="py-2 border-b border-white/5 bg-black/5 flex items-center justify-between">
                <RoadmapTabs
                    activeTab={activeRoundTab}
                    onTabChange={setActiveRoundTab}
                    showInvited={event?.hasInvitedTeams}
                    showT1Special={event?.hasT1SpecialTeams}
                />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFocus}
                    className={`h-8 w-8 p-0 transition-all duration-300 ${isFocusMode ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                    {isFocusMode ? <PanelTopOpen className="w-4 h-4" /> : <PanelTopClose className="w-4 h-4" />}
                </Button>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <RoundsSidebar />

                {/* Main Content: Round Details */}
                <div className="flex-1 flex flex-col min-w-0 bg-black/5 overflow-hidden">
                    {selectedRound ? (
                        <>
                            <RoundHeader />

                            <div className="flex-1 py-2 overflow-y-auto scrollbar-hide">
                                {!selectedRound.isPlaceholder ? (
                                    <GroupsGrid />
                                ) : (
                                    <div className="h-full flex items-center justify-center p-4">
                                        <TournamentEmpty 
                                            message="Round Not Ready"
                                            subMessage={isMainRoadmap && hasMappings && selectedRound?.status === 'pending' ? 
                                                "This round hasn't been initialized yet. You need to complete the previous round or manually merge teams." : 
                                                "This round hasn't been initialized yet. You need to complete the previous round or manually merge teams."
                                            }
                                            icon={AlertTriangle}
                                            className="w-full max-w-2xl bg-white/5 border-white/5 shadow-none py-12"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <TournamentEmpty 
                            message="Select a Round"
                            subMessage="Choose a round from the sidebar to view matching groups and results."
                            icon={PanelTopOpen}
                            className="h-full bg-transparent border-none shadow-none"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
