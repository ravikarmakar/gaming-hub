import { useEffect } from "react";
import { Zap, LayoutGrid, Users, CircleCheckBig as CircleCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRoundActions } from "@/features/tournaments/hooks";
import { GroupsGrid } from "./groups/GroupsGrid";
import { useTournamentDashboard } from "@/features/tournaments/context/TournamentDashboardContext";
import { useTournamentDialogs } from "@/features/tournaments/context/TournamentDialogContext";
import { useRoundsState } from "@/features/tournaments/context/TournamentRoundsContext";
import { TournamentLoading, TournamentEmpty } from "../shared/TournamentFeedback";

/**
 * ScrimsManager handles the configuration and execution of scrim-type tournaments.
 * Consumes TournamentDashboardContext and TournamentDialogContext.
 */
export const ScrimsManager = () => {
    const { eventId, setSelectedRoundId } = useTournamentDashboard();
    const { openDialog } = useTournamentDialogs();

    const {
        rounds = [],
        isLoading = false,
        teamPreview = null
    } = useRoundsState();

    const {
        isCreatingGroups = false,
    } = useRoundActions(eventId);

    // The first round is our scrim round (usually standard 'tournament' type for the initial round)
    const scrimRound = rounds.find((r: any) => (r.type || "tournament") === "tournament") || null;

    // Sync the selectedRoundId with the scrim round so the GroupsGrid (via context) knows which data to show
    useEffect(() => {
        if (scrimRound?._id) {
            setSelectedRoundId(scrimRound._id);
        }
    }, [scrimRound?._id, setSelectedRoundId]);

    if (isLoading) {
        return <TournamentLoading text="Loading Scrims..." />;
    }

    // Step 1: Initialize Scrim (Create first round)
    if (!scrimRound) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <TournamentEmpty 
                    message="Setup Scrims"
                    subMessage="Initialize the first round of your scrim to start organizing teams and groups."
                    icon={Zap}
                    action={(
                        <Button
                            onClick={() => openDialog('createRound', { isScrim: true, initialName: 'Scrim Round', type: 'tournament' })}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-black tracking-widest uppercase text-[10px] h-11 px-10 rounded-2xl transition-all shadow-lg shadow-purple-600/20"
                        >
                            Start Scrim
                        </Button>
                    )}
                />
            </div>
        );
    }

    // Step 2: Generate Groups
    const hasGroups = scrimRound.groups && scrimRound.groups.length > 0;
    const registeredCount = teamPreview?.totalCount || 0;

    return (
        <div className="px-2 py-0 space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent p-4 px-1 rounded-2xl">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">{scrimRound.roundName}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-500 font-medium text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                            <Users className="w-3 h-3" />
                            {registeredCount} Registered
                        </p>
                        <div className="h-2.5 w-px bg-white/10" />
                        <p className="text-gray-500 font-medium text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                            <CircleCheck2 className="w-3 h-3 text-green-500" />
                            {scrimRound.groups?.filter((g: any) => g.status === 'completed').length || 0} / {scrimRound.groups?.length || 0} Matches
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    {!hasGroups && (
                        <>
                            <Button
                                onClick={() => openDialog('confirmGroups', scrimRound)}
                                disabled={isCreatingGroups || registeredCount < 5}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wider uppercase text-[10px] h-9 px-5 rounded-lg transition-all flex items-center gap-1.5"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Create Groups
                            </Button>
                            {registeredCount > 0 && registeredCount < 5 && (
                                <p className="text-[9px] text-amber-500 font-bold uppercase tracking-wider animate-pulse">
                                    Min 5 teams required
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Groups Grid */}
            {hasGroups ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <LayoutGrid className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Match Groups</h3>
                    </div>
                    <GroupsGrid />
                </div>
            ) : (
                <TournamentEmpty 
                    message="No Groups Yet"
                    subMessage="Create match groups using the button above to begin."
                    icon={LayoutGrid}
                    fullHeight={false}
                    className="py-16 bg-transparent border-white/5 shadow-none"
                />
            )}
        </div>
    );
};

