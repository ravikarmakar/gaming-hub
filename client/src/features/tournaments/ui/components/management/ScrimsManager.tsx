import { Loader2, Zap, LayoutGrid, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

import { useRoundsSidebar, useRoundActions } from "@/features/tournaments/hooks";
import { GroupsGrid } from "./GroupsGrid";
import { CreateRoundDialog } from "./rounds/CreateRoundDialog";

interface ScrimsManagerProps {
    eventId: string;
}

export const ScrimsManager = ({ eventId }: ScrimsManagerProps) => {
    const {
        rounds = [],
        isLoading = false,
        teamPreview = { totalCount: 0 }
    } = useRoundsSidebar(eventId);

    const {
        handleCreateGroups,
        isCreatingGroups = false,
        isConfirmGroupsOpen = false,
        setIsConfirmGroupsOpen,
        isCreateRoundOpen = false,
        setIsCreateRoundOpen
    } = useRoundActions(eventId, rounds, "tournament");

    // The first round is our scrim round
    const scrimRound = rounds.find(r => (r.type || "tournament") === "tournament") || null;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin mb-3" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Scrims...</p>
            </div>
        );
    }

    // Step 1: Initialize Scrim (Create first round)
    if (!scrimRound) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="relative group overflow-hidden bg-transparent backdrop-blur-xl rounded-3xl p-10 text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-rose-600/5 opacity-50" />

                    <div className="relative z-10">
                        <div className="relative mb-6 inline-block">
                            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-500">
                                <Zap className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight uppercase">
                            Setup <span className="text-purple-500">Scrims</span>
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed font-medium">
                            Initialize the first round of your scrim to start organizing teams and groups.
                        </p>

                        <Button
                            onClick={() => setIsCreateRoundOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold tracking-wider uppercase text-[10px] h-10 px-8 rounded-xl transition-all"
                        >
                            Start Scrim
                        </Button>
                    </div>
                </div>

                <CreateRoundDialog
                    open={isCreateRoundOpen}
                    onOpenChange={setIsCreateRoundOpen}
                    eventId={eventId}
                    type="tournament"
                    initialName="Scrim Round"
                    isScrim={true}
                />
            </div>
        );
    }

    // Step 2: Generate Groups
    const hasGroups = scrimRound.groups && scrimRound.groups.length > 0;

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
                            {teamPreview?.totalCount || 0} Registered
                        </p>
                        <div className="h-2.5 w-px bg-white/10" />
                        <p className="text-gray-500 font-medium text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {scrimRound.groups?.filter(g => g.status === 'completed').length || 0} / {scrimRound.groups?.length || 0} Matches
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    {!hasGroups && (
                        <>
                            <Button
                                onClick={() => setIsConfirmGroupsOpen(true)}
                                disabled={isCreatingGroups || (teamPreview?.totalCount || 0) < 5}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wider uppercase text-[10px] h-9 px-5 rounded-lg transition-all flex items-center gap-1.5"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Create Groups
                            </Button>
                            {(teamPreview?.totalCount || 0) > 0 && (teamPreview?.totalCount || 0) < 5 && (
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
                    <GroupsGrid
                        roundId={scrimRound._id}
                        eventId={eventId}
                        search=""
                        statusFilter=""
                        sortBy="matchTime-asc"
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-transparent rounded-3xl">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                        <LayoutGrid className="w-7 h-7 text-gray-800" />
                    </div>
                    <h3 className="text-base font-bold text-gray-600 uppercase tracking-widest mb-1">No Groups Yet</h3>
                    <p className="text-gray-700 max-w-xs text-center text-xs font-medium">
                        Create match groups using the button above to begin.
                    </p>
                </div>
            )}

            <ConfirmActionDialog
                open={isConfirmGroupsOpen}
                onOpenChange={setIsConfirmGroupsOpen}
                title="Generate Match Groups?"
                description={
                    <div className="space-y-4">
                        <p>This will automatically distribute the <strong className="text-white">{teamPreview?.totalCount} registered teams</strong> into match groups based on your event configuration.</p>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Participating Teams</span>
                            <span className="text-xl font-black text-white">{teamPreview?.totalCount} Teams</span>
                        </div>
                    </div>
                }
                actionLabel="Generate Groups"
                onConfirm={async () => {
                    await handleCreateGroups(scrimRound._id);
                    setIsConfirmGroupsOpen(false);
                }}
                isLoading={isCreatingGroups}
                variant="default"
            />
        </div>
    );
};
