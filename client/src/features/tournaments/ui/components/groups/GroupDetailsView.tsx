import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Loader2,
    Edit2,
    UserPlus,
    Swords,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Clock,
    Activity,
    MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GroupActionsMenu } from "./GroupActionsMenu";

import { GroupLeaderboardTable } from "./GroupLeaderboardTable";
import { Group } from "../../../hooks";

interface GroupDetailsViewProps {
    currentGroup: Group | undefined;
    leaderboard: any;
    setSelectedGroupId: (id: string | null) => void;
    effectiveTotalMatch: number;
    isGroupCompleted: boolean;
    qualifyingTeams: number;
    isResultsMode: boolean;
    setIsResultsMode: (mode: boolean) => void;
    handleSubmitResults: () => void;
    isSaving: boolean;
    openInviteModal: (group: Group) => void;
    tempResults: Record<string, { kills: number, rank: number }>;
    handleResultChange: (teamId: string, field: 'kills' | 'rank', value: number) => void;
    activeRoundTab: string;
    openMergeModal: (team: any) => void;
    selectedPairing: 'AxB' | 'BxC' | 'AxC' | null;
    setSelectedPairing: (pairing: 'AxB' | 'BxC' | 'AxC' | null) => void;
    onNextGroup?: () => void;
    onPreviousGroup?: () => void;
    hasNextGroup?: boolean;
    hasPreviousGroup?: boolean;
    openEditModal: (group: Group) => void;
    openDeleteModal: (group: Group) => void;
    openChatModal: (group: Group) => void;
    currentGroupIndex?: number;
    totalGroupsCount?: number;
    isLoading?: boolean;
    isGrandFinale?: boolean;
}

const PAIRING_LABELS: Record<string, { label: string; color: string }> = {
    AxB: { label: "Group A & B", color: "blue" },
    BxC: { label: "Group B & C", color: "purple" },
    AxC: { label: "Group A & C", color: "orange" },
};

export const GroupDetailsView = ({
    currentGroup,
    leaderboard,
    setSelectedGroupId,
    effectiveTotalMatch,
    isGroupCompleted,
    qualifyingTeams,
    isResultsMode,
    setIsResultsMode,
    handleSubmitResults,
    isSaving,
    openInviteModal,
    tempResults,
    handleResultChange,
    activeRoundTab,
    openMergeModal,
    selectedPairing,
    setSelectedPairing,
    onNextGroup,
    onPreviousGroup,
    hasNextGroup,
    hasPreviousGroup,
    openEditModal,
    openDeleteModal,
    openChatModal,
    currentGroupIndex,
    totalGroupsCount,
    isLoading,
    isGrandFinale,
}: GroupDetailsViewProps) => {
    // Stash the last valid leaderboard to prevent "blinking" empty state during navigation
    const [stashedLeaderboard, setStashedLeaderboard] = useState<any>(null);

    useEffect(() => {
        // Clear stash when group ID changes to prevent stale data
        setStashedLeaderboard(null);
    }, [currentGroup?._id]);

    useEffect(() => {
        if (leaderboard && !isLoading) {
            setStashedLeaderboard(leaderboard);
        }
    }, [leaderboard, isLoading]);

    // Use the active leaderboard if available, otherwise fallback to the current one
    const activeLeaderboard = isLoading ? stashedLeaderboard || leaderboard : leaderboard;

    // Stability: Only return null if currentGroup is missing. 
    // If leaderboard is missing (e.g. during fast navigation), we keep the shell mounted.
    if (!currentGroup) return null;

    const qualifiedCount = activeLeaderboard?.teamScore?.filter((t: any) => t.isQualified).length || 0;

    // For league groups: submit button is shown only after a pairing is selected
    const needsPairingSelection = currentGroup?.isLeague && isResultsMode && !selectedPairing;

    // Build sub-group → team id set mapping (for dimming in the table)
    const subGroupTeamSets: Record<string, Set<string>> = {};
    if (currentGroup?.subGroups?.length) {
        currentGroup.subGroups.forEach(sg => {
            const name = sg.name; // "Sub-Group A", "Sub-Group B", "Sub-Group C"
            subGroupTeamSets[name] = new Set(
                sg.teams.map(t => (typeof t === 'string' ? t : (t as any)._id?.toString() || t))
            );
        });
    }

    return (
        <div className="space-y-3">
            {/* Header / Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedGroupId(null)}
                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
                        title="Back to Groups"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">
                                {currentGroup?.groupName || "Group Details"}
                            </h3>

                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                                {currentGroup?.status === 'completed' ? (
                                    <div className="flex items-center gap-1.5" title="Completed">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Done</span>
                                    </div>
                                ) : currentGroup?.status === 'ongoing' ? (
                                    <div className="flex items-center gap-1.5" title="Ongoing">
                                        <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5" title="Pending">
                                        <Clock className="w-3 h-3 text-yellow-500" />
                                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Wait</span>
                                    </div>
                                )}

                            </div>

                            {currentGroup?.isLeague && (
                                <Badge className="h-5 px-2 text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                                    League Phase
                                </Badge>
                            )}
                            {!currentGroup?.isLeague && (
                                <Badge variant="outline" className="h-5 px-2 text-[10px] text-gray-400 border-white/10 font-black uppercase tracking-widest bg-white/5">
                                    Matches: {currentGroup?.matchesPlayed || 0} / {effectiveTotalMatch}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">


                            {currentGroup?.matchTime && (
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">
                                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                                    {new Date(currentGroup.matchTime).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Qualification Monitor */}
                    <div className="flex items-center gap-2.5 px-3 py-0.5 bg-black/40 rounded-xl border border-white/10 shadow-inner">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none">
                                {isGrandFinale ? 'Winners' : 'Qualified'}
                            </span>
                            <div className="flex items-center gap-1">
                                <span className={`text-sm font-black tracking-tight ${qualifiedCount >= qualifyingTeams ? 'text-green-400' : 'text-white'}`}>
                                    {qualifiedCount}
                                </span>
                                <span className="text-gray-600 font-black text-xs">/</span>
                                <span className="text-sm font-black text-gray-400">
                                    {qualifyingTeams}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-1" />

                    <div className="flex items-center gap-2">
                        {!isGroupCompleted && (
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant={isResultsMode ? "default" : "outline"}
                                    onClick={() => {
                                        if (isResultsMode) {
                                            setIsResultsMode(false);
                                            setSelectedPairing(null);
                                        } else {
                                            setIsResultsMode(true);
                                        }
                                    }}
                                    className={`h-8 px-4 text-xs font-black uppercase tracking-wider transition-all duration-300 ${isResultsMode
                                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] border-none"
                                        : "bg-purple-500/5 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 hover:text-purple-300"
                                        }`}
                                >
                                    {isResultsMode ? "Cancel Entry" : "Enter Results"}
                                </Button>

                                {isResultsMode && !needsPairingSelection && (
                                    <Button
                                        size="sm"
                                        onClick={handleSubmitResults}
                                        disabled={isSaving}
                                        className="h-8 px-4 text-xs bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wider shadow-[0_0_15px_rgba(22,163,74,0.2)]"
                                    >
                                        {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5 mr-1.5" />}
                                        Submit {selectedPairing && `(${selectedPairing})`}
                                    </Button>
                                )}

                                {!isResultsMode && currentGroup?.status === 'pending' && (
                                    (currentGroup?.teams?.length || 0) < 18
                                        ? (currentGroup?.teams?.length || 0) < 18
                                        : (currentGroup?.teams?.length || 0) < (currentGroup?.groupSize || 12)
                                ) && (
                                        <Button
                                            size="sm"
                                            onClick={() => currentGroup && openInviteModal(currentGroup)}
                                            className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                                        >
                                            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                            Add Team
                                        </Button>
                                    )}
                            </div>
                        )}

                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 ml-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => currentGroup && openChatModal(currentGroup)}
                                className="h-8 w-8 text-gray-400 hover:text-indigo-400 hover:bg-white/5 transition-colors"
                                title="Group Chat"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                            </Button>

                            <div className="w-px h-4 bg-white/10 mx-0.5" />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onPreviousGroup?.()}
                                disabled={!hasPreviousGroup || isLoading}
                                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-colors"
                                title="Previous Group"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </Button>

                            <div className="px-2 min-w-[50px] flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                                ) : (
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] tabular-nums">
                                        {(currentGroupIndex || 0) > 0 ? currentGroupIndex : "-"}<span className="text-gray-700 mx-1">/</span>{totalGroupsCount || "-"}
                                    </span>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onNextGroup?.()}
                                disabled={!hasNextGroup || isLoading}
                                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-colors"
                                title="Next Group"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Button>

                            <div className="w-px h-4 bg-white/10 mx-0.5" />

                            <GroupActionsMenu
                                group={currentGroup}
                                onEdit={openEditModal}
                                onDelete={openDeleteModal}
                                align="end"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* League Pairing Selector — 3 buttons (AxB, BxC, AxC) */}
            {currentGroup?.isLeague && isResultsMode && (
                <div className="p-2 bg-black/30 border border-white/10 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Swords className="w-3 h-3 text-amber-400" />
                        Select match pairing to submit — only that pairing's 12 teams will be scored
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {(["AxB", "BxC", "AxC"] as const).map(pair => {
                            const isActive = selectedPairing === pair;
                            const { label, color } = PAIRING_LABELS[pair];

                            // Get pairing-specific match count from the group data
                            const pairMatchesPlayed = currentGroup?.pairingMatches?.[pair] || 0;
                            const totalPossiblePerPair = Math.floor(effectiveTotalMatch / 3);

                            const colorMap: Record<string, string> = {
                                blue: isActive
                                    ? "bg-blue-500/30 border-blue-400/60 text-blue-200"
                                    : "bg-blue-500/5 border-blue-500/20 text-blue-400 hover:bg-blue-500/15 hover:border-blue-400/40",
                                purple: isActive
                                    ? "bg-purple-500/30 border-purple-400/60 text-purple-200"
                                    : "bg-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/15 hover:border-purple-400/40",
                                orange: isActive
                                    ? "bg-orange-500/30 border-orange-400/60 text-orange-200"
                                    : "bg-orange-500/5 border-orange-500/20 text-orange-400 hover:bg-orange-500/15 hover:border-orange-400/40",
                            };
                            return (
                                <button
                                    key={pair}
                                    onClick={() => setSelectedPairing(isActive ? null : pair)}
                                    disabled={pairMatchesPlayed >= totalPossiblePerPair}
                                    className={`relative px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider transition-all duration-200 ${colorMap[color]} ${pairMatchesPlayed >= totalPossiblePerPair ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-[10px] opacity-60 mb-0.5">
                                        Match {pairMatchesPlayed}/{totalPossiblePerPair}
                                    </div>
                                    <div>{label}</div>
                                    {isActive && (
                                        <span className="absolute top-1 right-1.5 text-[8px] font-black uppercase tracking-widest opacity-80">
                                            ✓ active
                                        </span>
                                    )}
                                    {pairMatchesPlayed >= totalPossiblePerPair && (
                                        <span className="absolute top-1 right-1.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
                                            FULL
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {selectedPairing && (
                        <p className="text-[10px] text-green-400 mt-2 font-bold">
                            ✓ {PAIRING_LABELS[selectedPairing].label} selected — enter kills & rank below for those 12 teams, then Submit
                        </p>
                    )}
                    {!selectedPairing && (
                        <p className="text-[10px] text-gray-600 mt-2">
                            ↑ Click a match pairing above before entering results
                        </p>
                    )}
                </div>
            )}

            <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
                <GroupLeaderboardTable
                    leaderboard={activeLeaderboard}
                    isResultsMode={isResultsMode}
                    tempResults={tempResults}
                    handleResultChange={handleResultChange}
                    activeRoundTab={activeRoundTab}
                    openMergeModal={openMergeModal}
                    selectedPairing={selectedPairing}
                    isLeague={currentGroup?.isLeague}
                    subGroupTeamSets={subGroupTeamSets}
                />
            </div>
        </div>
    );
};
