import { GitMerge } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GroupLeaderboardTableProps {
    leaderboard: any;
    isResultsMode: boolean;
    tempResults: Record<string, { kills: number, rank: number }>;
    handleResultChange: (teamId: string, field: 'kills' | 'rank', value: number) => void;
    activeRoundTab: string;
    openMergeModal: (team: any) => void;
    // League sub-group pairing — when set, teams outside the active pairing are dimmed
    selectedPairing?: 'AxB' | 'BxC' | 'AxC' | null;
    isLeague?: boolean;
    subGroupTeamSets?: Record<string, Set<string>>; // {"Sub-Group A": Set<id>, ...}
}

// Determine which sub-group a team belongs to based on pairingType
// Returns true if the team should be active (in the pairing), false if dimmed
function isTeamInActivePairing(
    teamId: string,
    pairingType: 'AxB' | 'BxC' | 'AxC' | null | undefined,
    subGroupTeamSets: Record<string, Set<string>> | undefined,
    allTeamIds: string[],
    isLeague: boolean
): boolean {
    if (!isLeague || !pairingType) return true; // No pairing selected or not league → show all

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

export const GroupLeaderboardTable = ({
    leaderboard,
    isResultsMode,
    tempResults,
    handleResultChange,
    activeRoundTab,
    openMergeModal,
    selectedPairing,
    isLeague = false,
    subGroupTeamSets,
}: GroupLeaderboardTableProps) => {

    return (
        <div className="bg-gray-900/40 border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-200 uppercase bg-black/40 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-3 text-center">Rank</th>
                            <th className="px-6 py-3">Team</th>
                            {isLeague && <th className="px-4 py-3 text-center text-[10px]">Group</th>}
                            <th className="px-6 py-3 text-center">Matches</th>
                            <th className="px-6 py-3 text-center">Match Rank</th>
                            <th className="px-6 py-3 text-center">Kills</th>
                            <th className="px-6 py-3 text-center">Total Pts</th>
                            {activeRoundTab === 't1-special' && <th className="px-6 py-3 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {[...leaderboard.teamScore].sort((a, b) => {
                            if (a.isQualified !== b.isQualified) return a.isQualified ? -1 : 1;
                            return b.totalPoints - a.totalPoints;
                        }).map((entry, index, allTeams) => {
                            const allTeamIds = allTeams.map(t => t.teamId._id);
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
                            let rowStyle = "hover:bg-white/5";
                            if (isResultsMode && selectedPairing && !inActivePairing) {
                                rowStyle = "opacity-25 grayscale pointer-events-none";
                            } else if (isResultsMode && selectedPairing && inActivePairing) {
                                rowStyle = "bg-amber-500/5 border-l-2 border-l-amber-500/40";
                            }

                            // Qualified highlighting overrides dim
                            let rankBadge = null;
                            if (entry.isQualified) {
                                if (index === 0) {
                                    rowStyle = `${rowStyle.includes('opacity') ? '' : rowStyle} bg-yellow-500/20 hover:bg-yellow-500/30 border-l-4 border-l-yellow-400`;
                                    rankBadge = <span className="text-yellow-500">🏆 1st</span>;
                                } else if (index === 1) {
                                    rowStyle = `${rowStyle.includes('opacity') ? '' : rowStyle} bg-slate-400/20 hover:bg-slate-400/30 border-l-4 border-l-slate-300`;
                                    rankBadge = <span className="text-slate-300">🥈 2nd</span>;
                                } else if (index === 2) {
                                    rowStyle = `${rowStyle.includes('opacity') ? '' : rowStyle} bg-amber-700/20 hover:bg-amber-700/30 border-l-4 border-l-amber-600`;
                                    rankBadge = <span className="text-amber-600">🥉 3rd</span>;
                                } else {
                                    rowStyle = `${rowStyle.includes('opacity') ? '' : rowStyle} bg-green-500/10 hover:bg-green-500/20 border-l-4 border-l-green-500`;
                                    rankBadge = <span className="text-green-500">#{index + 1}</span>;
                                }
                            }

                            let nameColor = entry.isQualified ? "text-green-400" : "text-gray-200";
                            if (entry.isQualified) {
                                if (index === 0) nameColor = "text-yellow-400";
                                else if (index === 1) nameColor = "text-slate-200";
                                else if (index === 2) nameColor = "text-orange-400";
                            }

                            return (
                                <tr
                                    key={teamId}
                                    className={`border-b border-white/5 transition-all duration-300 ${rowStyle}`}
                                >
                                    <td className="px-6 py-4 font-bold text-white text-center">
                                        {rankBadge || `#${index + 1}`}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        {entry.teamId.teamLogo ? (
                                            <img src={entry.teamId.teamLogo} alt={entry.teamId.teamName} className="w-8 h-8 rounded-full bg-gray-800 object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 border border-white/10">
                                                {entry.teamId.teamName?.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${nameColor}`}>
                                                    {entry.teamId.teamName}
                                                </span>
                                            </div>
                                            {entry.isQualified && <span className={`block text-[10px] uppercase tracking-wider font-black ${nameColor}`}>Qualified</span>}
                                        </div>
                                    </td>
                                    {/* Sub-Group Badge column */}
                                    {isLeague && (
                                        <td className="px-4 py-4 text-center">
                                            {subGroupLabel && (
                                                <Badge className={`h-5 px-1.5 text-[10px] font-black border uppercase tracking-widest ${SUB_GROUP_COLORS[subGroupLabel as keyof typeof SUB_GROUP_COLORS]}`}>
                                                    Sub-{subGroupLabel}
                                                </Badge>
                                            )}
                                        </td>
                                    )}
                                    {/* Per-team matches played */}
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-gray-400 text-xs font-bold">{entry.matchesPlayed || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isResultsMode && inActivePairing ? (
                                            <Input
                                                type="number"
                                                min="1"
                                                autoFocus={index === 0}
                                                value={stats.rank ?? ''}
                                                placeholder="Rank"
                                                onChange={(e) => handleResultChange(teamId, 'rank', parseInt(e.target.value) || 0)}
                                                className="w-20 h-8 text-center bg-black/60 border-amber-500/30 focus:border-amber-500 text-white mx-auto font-bold"
                                            />
                                        ) : (
                                            <span className="text-gray-300 font-medium">#{entry.position || '-'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isResultsMode && inActivePairing ? (
                                            <Input
                                                type="number"
                                                min="0"
                                                value={stats.kills ?? ''}
                                                placeholder="Kills"
                                                onChange={(e) => handleResultChange(teamId, 'kills', parseInt(e.target.value) || 0)}
                                                className="w-20 h-8 text-center bg-black/60 border-amber-500/30 focus:border-amber-500 text-white mx-auto font-bold"
                                            />
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-black">
                                                    {entry.kills} Kills
                                                </Badge>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-white text-lg">
                                        {entry.totalPoints}
                                    </td>
                                    {activeRoundTab === 't1-special' && (
                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openMergeModal(entry.teamId)}
                                                className="h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300 transition-all shadow-sm"
                                            >
                                                <GitMerge className="w-3.5 h-3.5 mr-1.5" />
                                                Merge
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {leaderboard.teamScore.length === 0 && (
                            <tr>
                                <td 
                                    colSpan={6 + (isLeague ? 1 : 0) + (activeRoundTab === 't1-special' ? 1 : 0)} 
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    No teams in this group yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
