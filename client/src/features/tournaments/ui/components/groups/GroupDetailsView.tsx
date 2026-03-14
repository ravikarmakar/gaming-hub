import { ArrowLeft, Loader2, Edit2, UserPlus, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}: GroupDetailsViewProps) => {
    if (!leaderboard) return null;

    const qualifiedCount = leaderboard.teamScore.filter((t: any) => t.isQualified).length;

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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedGroupId(null)}
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                        title="Back to Groups"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{currentGroup?.groupName || "Group Details"}</h3>
                            <div className="flex items-center gap-1 ml-1">
                                <Badge className={`h-4 px-1.5 text-[10px] font-black uppercase border shadow-sm ${currentGroup?.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    currentGroup?.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                        'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                    }`}>
                                    {currentGroup?.status || 'Pending'}
                                </Badge>
                                {currentGroup?.isLeague && (
                                    <Badge className="h-4 px-1.5 text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        League
                                    </Badge>
                                )}
                                {!currentGroup?.isLeague && (
                                    <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-gray-400 border-white/10 font-black uppercase tracking-tighter">
                                        {currentGroup?.matchesPlayed || 0}/{effectiveTotalMatch} Matches
                                    </Badge>
                                )}
                                {isGroupCompleted && (
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 font-black uppercase tracking-tighter">
                                        {qualifiedCount} Qualified
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {currentGroup?.matchTime && (
                            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1 h-1 rounded-full bg-purple-500" />
                                Match Time: {new Date(currentGroup.matchTime).toLocaleString(undefined, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Qualified:</span>
                        <span className={`text-sm font-black ${qualifiedCount === qualifyingTeams ? 'text-green-400' : 'text-white'}`}>
                            {qualifiedCount}
                            <span className="text-gray-600 mx-1">/</span>
                            {qualifyingTeams}
                        </span>
                    </div>

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
                                className={`h-8 text-xs font-bold ${isResultsMode
                                    ? "bg-purple-600 hover:bg-purple-700 text-white border-none"
                                    : "bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 hover:text-purple-300"
                                    }`}
                            >
                                {isResultsMode ? "Cancel Entry" : "Enter Results"}
                            </Button>

                            {/* Submit appears only once pairing is selected (for league) or results mode is active (standard) */}
                            {isResultsMode && !needsPairingSelection && (
                                <Button
                                    size="sm"
                                    onClick={handleSubmitResults}
                                    disabled={isSaving}
                                    className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-bold"
                                >
                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5 mr-1.5" />}
                                    Submit {selectedPairing && `(${selectedPairing})`}
                                </Button>
                            )}

                            {!isResultsMode && (
                                (currentGroup?.isLeague 
                                    ? (currentGroup?.teams?.length || 0) < 18 
                                    : (currentGroup?.teams?.length || 0) < (currentGroup?.groupSize || 12))
                            ) && (
                                <Button
                                    size="sm"
                                    onClick={() => currentGroup && openInviteModal(currentGroup)}
                                    className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                >
                                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                    Add Team
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* League Pairing Selector — 3 buttons (AxB, BxC, AxC) */}
            {currentGroup?.isLeague && isResultsMode && (
                <div className="p-3 bg-black/30 border border-white/10 rounded-xl">
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
                                    className={`relative px-3 py-2.5 rounded-lg border text-xs font-black uppercase tracking-wider transition-all duration-200 ${colorMap[color]} ${pairMatchesPlayed >= totalPossiblePerPair ? 'opacity-40 cursor-not-allowed' : ''}`}
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

            <GroupLeaderboardTable
                leaderboard={leaderboard}
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
    );
};
