import React from "react";
import { GitMerge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Determine which sub-group a team belongs to based on pairingType
// Returns true if the team should be active (in the pairing), false if dimmed
function isTeamInActivePairing(
    teamId: string,
    pairingType: 'AxB' | 'BxC' | 'AxC' | null | undefined,
    subGroupTeamSets: Record<string, Set<string>> | undefined,
    allTeamIds: string[],
    isLeague: boolean
): boolean {
    if (!isLeague) return true;
    if (!pairingType) return false;

    // If subGroupTeamSets exists and is populated, use it
    if (subGroupTeamSets && Object.keys(subGroupTeamSets).length > 0) {
        const sgA = subGroupTeamSets["Sub-Group A"] || new Set();
        const sgB = subGroupTeamSets["Sub-Group B"] || new Set();
        const sgC = subGroupTeamSets["Sub-Group C"] || new Set();

        if (pairingType === "AxB") return sgA.has(teamId) || sgB.has(teamId);
        if (pairingType === "BxC") return sgB.has(teamId) || sgC.has(teamId);
        if (pairingType === "AxC") return sgA.has(teamId) || sgC.has(teamId);
        return true;
    }

    // Fallback: Derivation by stable index (using team IDs sorted alphabetically)
    const sortedIds = [...allTeamIds].sort();
    const teamIndex = sortedIds.indexOf(teamId);
    const chunkSize = Math.ceil(sortedIds.length / 3);
    const teamGroup = teamIndex < chunkSize ? "A" : teamIndex < chunkSize * 2 ? "B" : "C";

    if (pairingType === "AxB") return teamGroup === "A" || teamGroup === "B";
    if (pairingType === "BxC") return teamGroup === "B" || teamGroup === "C";
    if (pairingType === "AxC") return teamGroup === "A" || teamGroup === "C";

    return true;
}

// Returns the sub-group label for a team
function getSubGroupLabel(
    teamId: string,
    subGroupTeamSets: Record<string, Set<string>> | undefined,
    allTeamIds: string[]
): string | null {
    // If subGroupTeamSets exists and is populated, use it
    if (subGroupTeamSets && Object.keys(subGroupTeamSets).length > 0) {
        if ((subGroupTeamSets["Sub-Group A"] || new Set()).has(teamId)) return "A";
        if ((subGroupTeamSets["Sub-Group B"] || new Set()).has(teamId)) return "B";
        if ((subGroupTeamSets["Sub-Group C"] || new Set()).has(teamId)) return "C";
        return null;
    }

    // Fallback: Derivation by stable index
    const sortedIds = [...allTeamIds].sort();
    const teamIndex = sortedIds.indexOf(teamId);
    const chunkSize = Math.ceil(sortedIds.length / 3);
    return teamIndex < chunkSize ? "A" : teamIndex < chunkSize * 2 ? "B" : "C";
}

const SUB_GROUP_COLORS: Record<string, string> = {
    A: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    B: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    C: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
};

interface LeaderboardRowProps {
    index: number;
    style: React.CSSProperties;
    data: {
        sortedScores: any[];
        isResultsMode: boolean;
        tempResults: Record<string, { kills: number, rank: number }>;
        handleResultChange: (teamId: string, field: 'kills' | 'rank', value: number) => void;
        activeRoundTab: string;
        openMergeModal: (team: any) => void;
        selectedPairing: 'AxB' | 'BxC' | 'AxC' | null | undefined;
        isLeague: boolean;
        subGroupTeamSets: Record<string, Set<string>> | undefined;
        allTeamIds: string[];
        gridTemplate: string;
    };
}

export const LeaderboardRow = React.memo(({ index, style, data }: LeaderboardRowProps) => {
    const { 
        sortedScores, 
        isResultsMode, 
        tempResults, 
        handleResultChange, 
        activeRoundTab, 
        openMergeModal, 
        selectedPairing, 
        isLeague, 
        subGroupTeamSets,
        allTeamIds,
        gridTemplate
    } = data;

    const entry = sortedScores[index];
    if (!entry) return null;

    const teamId = entry.teamId._id;
    const stats = tempResults[teamId] || { kills: 0, rank: 0 };
    const inActivePairing = isTeamInActivePairing(
        teamId,
        selectedPairing,
        subGroupTeamSets,
        allTeamIds,
        isLeague
    );
    const subGroupLabel = isLeague ? getSubGroupLabel(
        teamId,
        subGroupTeamSets,
        allTeamIds
    ) : null;

    // Row styling — dim teams outside the active pairing
    let rowBg = "bg-transparent hover:bg-white/5";
    let rowBorder = "";

    if (isResultsMode && selectedPairing) {
        if (!inActivePairing) {
            rowBg = "opacity-20 grayscale pointer-events-none";
        } else {
            rowBg = "bg-amber-500/[0.03] border-l-2 border-l-amber-500/40";
        }
    } else if (entry.isQualified) {
        if (index === 0) {
            rowBg = "bg-yellow-500/10 hover:bg-yellow-500/15";
            rowBorder = "border-l-4 border-l-yellow-400 shadow-[inset_4px_0_10px_-4px_rgba(250,204,21,0.2)]";
        } else if (index === 1) {
            rowBg = "bg-slate-300/10 hover:bg-slate-300/15";
            rowBorder = "border-l-4 border-l-slate-300 shadow-[inset_4px_0_10px_-4px_rgba(203,213,225,0.2)]";
        } else if (index === 2) {
            rowBg = "bg-orange-600/10 hover:bg-orange-600/15";
            rowBorder = "border-l-4 border-l-orange-500 shadow-[inset_4px_0_10px_-4px_rgba(249,115,22,0.2)]";
        } else {
            rowBg = "bg-green-500/[0.03] hover:bg-green-500/[0.08]";
            rowBorder = "border-l-4 border-l-green-500/50";
        }
    }

    let rankDisplay = null;
    if (entry.isQualified) {
        if (index === 0) {
            rankDisplay = (
                <div className="flex flex-col items-center">
                    <span className="text-yellow-400 text-xs font-black uppercase tracking-tighter">1st</span>
                    <div className="w-4 h-0.5 bg-yellow-400 mt-0.5 rounded-full" />
                </div>
            );
        } else if (index === 1) {
            rankDisplay = (
                <div className="flex flex-col items-center">
                    <span className="text-slate-300 text-xs font-black uppercase tracking-tighter">2nd</span>
                    <div className="w-4 h-0.5 bg-slate-300 mt-0.5 rounded-full" />
                </div>
            );
        } else if (index === 2) {
            rankDisplay = (
                <div className="flex flex-col items-center">
                    <span className="text-orange-500 text-xs font-black uppercase tracking-tighter">3rd</span>
                    <div className="w-4 h-0.5 bg-orange-500 mt-0.5 rounded-full" />
                </div>
            );
        } else {
            rankDisplay = <span className="text-green-500/80 font-black text-xs">#{index + 1}</span>;
        }
    }

    let nameColor = entry.isQualified ? "text-green-400" : "text-gray-200";
    if (entry.isQualified) {
        if (index === 0) nameColor = "text-yellow-300";
        else if (index === 1) nameColor = "text-white";
        else if (index === 2) nameColor = "text-orange-300";
    }

    return (
        <div 
            className={`grid group/row items-center border-b border-white/5 transition-all duration-300 ${rowBg} ${rowBorder}`}
            style={{ ...style, gridTemplateColumns: gridTemplate }}
        >
            {/* Rank */}
            <div className="px-6 py-4 text-center">
                {rankDisplay || <span className="text-gray-600 font-bold text-xs">#{index + 1}</span>}
            </div>

            {/* Team Profile */}
            <div className="px-6 py-4 overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        {entry.teamId.imageUrl ? (
                            <img 
                                src={entry.teamId.imageUrl} 
                                alt={entry.teamId.teamName} 
                                className="w-8 h-8 rounded-lg bg-black object-cover border border-white/10 group-hover/row:border-white/20 transition-colors"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden');
                                }}
                            />
                        ) : null}
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 border border-white/10 group-hover/row:border-white/20 transition-colors avatar-fallback ${entry.teamId.imageUrl ? 'hidden' : ''}`}>
                            {entry.teamId?.teamName?.substring(0, 2).toUpperCase() || "??"}
                        </div>
                        {entry.isQualified && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={`font-black text-[13px] tracking-tight uppercase truncate ${nameColor}`}>
                            {entry.teamId.teamName}
                        </span>
                        {entry.isQualified && (
                            <span className={`text-[9px] uppercase tracking-widest font-black ${nameColor} opacity-60 mt-0.5 truncate`}>
                                Finalist
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Group Label */}
            {isLeague && (
                <div className="px-4 py-4 text-center">
                    {subGroupLabel && (
                        <Badge className={`h-4 px-1 text-[8px] font-black border uppercase tracking-widest ${SUB_GROUP_COLORS[subGroupLabel as keyof typeof SUB_GROUP_COLORS]}`}>
                            S-{subGroupLabel}
                        </Badge>
                    )}
                </div>
            )}

            {/* Played */}
            <div className="px-6 py-4 text-center">
                <span className="text-gray-400 text-xs font-black tabular-nums">{entry.matchesPlayed || 0}</span>
            </div>

            {/* Position Points */}
            <div className="px-6 py-4 text-center">
                {isResultsMode && inActivePairing ? (
                    <Input
                        type="number"
                        min="1"
                        autoFocus={index === 0}
                        value={stats.rank ?? ''}
                        placeholder="0"
                        onChange={(e) => handleResultChange(teamId, 'rank', parseInt(e.target.value) || 0)}
                        className="w-14 h-8 text-center bg-black/60 border-amber-500/20 focus:border-amber-500 focus:bg-amber-500/10 text-white mx-auto font-black text-xs rounded-lg transition-all"
                    />
                ) : (
                    <span className="text-gray-400 font-black text-xs tabular-nums">{entry.positionPoints ?? entry.score ?? 0}</span>
                )}
            </div>

            {/* Kill Points */}
            <div className="px-6 py-4 text-center">
                {isResultsMode && inActivePairing ? (
                    <Input
                        type="number"
                        min="0"
                        value={stats.kills ?? ''}
                        placeholder="0"
                        onChange={(e) => handleResultChange(teamId, 'kills', parseInt(e.target.value) || 0)}
                        className="w-14 h-8 text-center bg-black/60 border-amber-500/20 focus:border-amber-500 focus:bg-amber-500/10 text-white mx-auto font-black text-xs rounded-lg transition-all"
                    />
                ) : (
                    <span className="flex items-center justify-center">
                        <div className="px-2 py-0.5 bg-red-500/5 text-red-400/80 border border-red-500/10 rounded font-black text-[10px] uppercase tracking-tighter">
                            {entry.kills || 0} Kill{(entry.kills || 0) !== 1 ? 's' : ''}
                        </div>
                    </span>
                )}
            </div>

            {/* Total Points */}
            <div className="px-6 py-4 text-center">
                <span className="font-black text-white text-base tracking-tighter tabular-nums">
                    {entry.totalPoints}
                </span>
            </div>

            {/* Operations */}
            {activeRoundTab === 't1-special' && (
                <div className="px-6 py-4 text-center">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openMergeModal(entry.teamId)}
                        className="h-8 px-2.5 text-[8px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-400/80 border border-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300 transition-all rounded-lg"
                    >
                        <GitMerge className="w-3 h-3 mr-1" />
                        Merge
                    </Button>
                </div>
            )}
        </div>
    );
});
