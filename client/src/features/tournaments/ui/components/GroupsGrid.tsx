import { useState, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeGrid, GridChildComponentProps } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Edit2, ArrowLeft, UserPlus, GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GroupCard } from "./GroupCard";
import { EditGroupDialog } from "./dialogs/EditGroupDialog";
import { DeleteGroupDialog } from "./dialogs/DeleteGroupDialog";
import { SubmitResultsDialog } from "./dialogs/SubmitResultsDialog";
import { GroupChatDialog } from "./dialogs/GroupChatDialog";
import { AddTeamDialog } from "./dialogs/AddTeamDialog";
import { MergeTeamToGroupDialog } from "./dialogs/MergeTeamToGroupDialog";
import { useGetRoundsQuery, useGetGroupsQuery, useGetLeaderboardQuery, useUpdateGroupResultsMutation, Group, useRoundsSidebar } from "../../hooks";
import { Input } from "@/components/ui/input";

interface GroupsGridProps {
    roundId: string;
    eventId: string;
}

export const GroupsGrid = ({ roundId, eventId }: GroupsGridProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { activeRoundTab } = useRoundsSidebar(eventId);

    const { data: rounds = [] } = useGetRoundsQuery(eventId);
    const { data, isLoading } = useGetGroupsQuery(roundId, currentPage);
    const groups = data?.groups || [];
    const { totalPages, totalGroups } = data?.pagination || { totalPages: 1, totalGroups: 0 };

    // Check if group is completed
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const { data: leaderboard } = useGetLeaderboardQuery(selectedGroupId || "");
    const { mutateAsync: updateGroupResults } = useUpdateGroupResultsMutation();

    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [chatGroup, setChatGroup] = useState<Group | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [inviteGroup, setInviteGroup] = useState<Group | null>(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [mergeTeam, setMergeTeam] = useState<any>(null);
    const [isMergeOpen, setIsMergeOpen] = useState(false);

    // ✅ Memoized Selectors for performance
    const { currentGroup, effectiveTotalMatch, isGroupCompleted, roundMatches } = useMemo(() => {
        const round = rounds.find(r => r._id === roundId);
        const group = groups.find(g => g._id === selectedGroupId);
        const rm = round?.matchesPerGroup;
        const totalMatch = rm || group?.totalMatch || 1;
        return {
            currentGroup: group,
            effectiveTotalMatch: totalMatch,
            isGroupCompleted: group?.status === 'completed',
            roundMatches: rm
        };
    }, [rounds, groups, roundId, selectedGroupId]);

    // ✅ Batch Entry State
    const [isResultsMode, setIsResultsMode] = useState(false);
    const [tempResults, setTempResults] = useState<Record<string, { kills: number, rank: number }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const openEditModal = useCallback((group: Group) => {
        setEditingGroup(group);
        setIsEditOpen(true);
    }, []);

    const openChatModal = useCallback((group: Group) => {
        setChatGroup(group);
        setIsChatOpen(true);
    }, []);

    const openInviteModal = useCallback((group: Group) => {
        setInviteGroup(group);
        setIsInviteOpen(true);
    }, []);

    const openDeleteModal = useCallback((group: Group) => {
        setDeletingGroup(group);
        setIsDeleteOpen(true);
    }, []);

    // ✅ Initialize tempResults when leaderboard loads or results mode is toggled
    useEffect(() => {
        if (isResultsMode) {
            // Reset to 0 when entering results mode to avoid accidentally submitting previous totals
            const emptyResults: Record<string, { kills: number, rank: number }> = {};
            leaderboard?.teamScore.forEach(t => {
                emptyResults[t.teamId._id] = { kills: 0, rank: 0 };
            });
            setTempResults(emptyResults);
        } else if (leaderboard?.teamScore) {
            // Otherwise show current totals for viewing
            const initialResults: Record<string, any> = {};
            leaderboard.teamScore.forEach(t => {
                initialResults[t.teamId._id] = {
                    kills: t.kills || 0,
                    rank: t.position || 0
                };
            });
            setTempResults(initialResults);
        }
    }, [leaderboard, isResultsMode]);



    // ✅ Handle Result Input Change
    const handleResultChange = useCallback((teamId: string, field: 'kills' | 'rank', value: number) => {
        setTempResults(prev => ({
            ...prev,
            [teamId]: {
                ...prev[teamId],
                [field]: value
            }
        }));
    }, []);

    // ✅ Handle Submission (Open Modal)
    const handleSubmitResults = () => {
        if (!selectedGroupId || !leaderboard || !currentGroup) return;
        setIsConfirmOpen(true);
    };

    // ✅ Final Submit Logic
    const handleConfirmSubmit = async () => {
        if (!selectedGroupId || !currentGroup) return;

        // Transform tempResults to array
        const resultsArray = Object.entries(tempResults).map(([teamId, stats]) => ({
            teamId,
            kills: stats.kills || 0,
            rank: stats.rank || 0
        }));

        setIsSaving(true);
        setIsConfirmOpen(false); // Close modal before API call
        try {
            await updateGroupResults({ groupId: selectedGroupId, eventId, results: resultsArray });
            setIsSaving(false);
            setIsResultsMode(false);
        } catch (error) {
            console.error(error);
            setIsSaving(false);
        }
    };

    // Reset Results mode when selecting another group
    useEffect(() => {
        if (selectedGroupId) {
            setIsResultsMode(false);
        }
    }, [selectedGroupId]);

    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, []);

    if (isLoading && groups.length === 0 && !selectedGroupId) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!isLoading && groups.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-500">
                No groups found. Create groups to get started.
            </div>
        )
    }

    // MAIN RENDER
    return (
        <div className="space-y-4">
            {selectedGroupId && leaderboard ? (
                // FULL VIEW: Group Details Table
                <div className="space-y-4">
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
                                        <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-gray-400 border-white/10 font-black uppercase tracking-tighter">
                                            {currentGroup?.matchesPlayed || 0}/{effectiveTotalMatch} Matches
                                        </Badge>
                                        {isGroupCompleted && (
                                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 font-black uppercase tracking-tighter">
                                                {leaderboard.teamScore.filter(t => t.isQualified).length} Qualified
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
                            {/* ✅ Qualification Stats */}
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Qualified:</span>
                                <span className={`text-sm font-black ${leaderboard.teamScore.filter(t => t.isQualified).length === (rounds.find(r => r._id === roundId)?.qualifyingTeams || 0) ? 'text-green-400' : 'text-white'}`}>
                                    {leaderboard.teamScore.filter(t => t.isQualified).length}
                                    <span className="text-gray-600 mx-1">/</span>
                                    {rounds.find(r => r._id === roundId)?.qualifyingTeams || 0}
                                </span>
                            </div>

                            {/* ✅ Results Mode Actions */}
                            {!isGroupCompleted && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant={isResultsMode ? "default" : "outline"}
                                        onClick={() => setIsResultsMode(!isResultsMode)}
                                        className={`h-8 text-xs font-bold ${isResultsMode
                                            ? "bg-purple-600 hover:bg-purple-700 text-white border-none"
                                            : "bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 hover:text-purple-300"
                                            }`}
                                    >
                                        {isResultsMode ? "Cancel Entry" : "Enter Results"}
                                    </Button>

                                    {isResultsMode ? (
                                        <Button
                                            size="sm"
                                            onClick={handleSubmitResults}
                                            disabled={isSaving}
                                            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-bold"
                                        >
                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5 mr-1.5" />}
                                            Submit
                                        </Button>
                                    ) : (
                                        (currentGroup?.teams?.length || 0) < 12 && (
                                            <Button
                                                size="sm"
                                                onClick={() => currentGroup && openInviteModal(currentGroup)}
                                                className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                            >
                                                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                                Add Team
                                            </Button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="bg-gray-900/40 border border-white/5 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-200 uppercase bg-black/40 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-3 text-center">Rank</th>
                                        <th className="px-6 py-3">Team</th>
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
                                    }).map((entry, index) => {
                                        const stats = tempResults[entry.teamId._id] || { kills: 0, rank: 0 };
                                        let rowStyle = "hover:bg-white/5";
                                        let rankBadge = null;

                                        if (entry.isQualified) {
                                            if (index === 0) {
                                                rowStyle = "bg-yellow-500/20 hover:bg-yellow-500/30 border-l-4 border-l-yellow-400";
                                                rankBadge = <span className="text-yellow-500">🏆 1st</span>;
                                            } else if (index === 1) {
                                                rowStyle = "bg-slate-400/20 hover:bg-slate-400/30 border-l-4 border-l-slate-300";
                                                rankBadge = <span className="text-slate-300">🥈 2nd</span>;
                                            } else if (index === 2) {
                                                rowStyle = "bg-amber-700/20 hover:bg-amber-700/30 border-l-4 border-l-amber-600";
                                                rankBadge = <span className="text-amber-600">🥉 3rd</span>;
                                            } else {
                                                rowStyle = "bg-green-500/10 hover:bg-green-500/20 border-l-4 border-l-green-500";
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
                                                key={index}
                                                className={`border-b border-white/5 transition-all duration-300 ${rowStyle}`}
                                            >
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {rankBadge || `#${index + 1}`}
                                                </td>
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    {entry.teamId.teamLogo ? (
                                                        <img src={entry.teamId.teamLogo} alt={entry.teamId.teamName} className="w-8 h-8 rounded-full bg-gray-800 object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                                                            {entry.teamId.teamName?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className={`font-bold ${nameColor}`}>
                                                            {entry.teamId.teamName}
                                                        </span>
                                                        {entry.isQualified && <span className={`block text-[10px] uppercase tracking-wider font-black ${nameColor}`}>Qualified</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {isResultsMode ? (
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={stats.rank}
                                                            onChange={(e) => handleResultChange(entry.teamId._id, 'rank', parseInt(e.target.value) || 0)}
                                                            className="w-20 h-8 text-center bg-black/40 border-white/10 mx-auto"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-300">Pos #{entry.position}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {isResultsMode ? (
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={stats.kills}
                                                            onChange={(e) => handleResultChange(entry.teamId._id, 'kills', parseInt(e.target.value) || 0)}
                                                            className="w-20 h-8 text-center bg-black/40 border-white/10 mx-auto"
                                                        />
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                                                            {entry.kills} Kills
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-white text-lg">
                                                    {entry.totalPoints}
                                                </td>
                                                {activeRoundTab === 't1-special' && (
                                                    <td className="px-6 py-4 text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setMergeTeam(entry.teamId);
                                                                setIsMergeOpen(true);
                                                            }}
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
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No teams in this group yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                // GRID VIEW: Groups Cards
                <div className="space-y-4">

                    <div className="rounded-xl border border-white/5 bg-gray-900/40 overflow-hidden h-[600px]">
                        <AutoSizer renderProp={({ width, height }) => {
                            let columnCount = 1;
                            if (width && width >= 1280) columnCount = 4;
                            else if (width && width >= 1024) columnCount = 3;
                            else if (width && width >= 768) columnCount = 2;

                            const rowCount = Math.ceil(groups.length / columnCount);
                            const columnWidth = width ? width / columnCount : 0;

                            // Each cell rendering function
                            const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
                                const index = rowIndex * columnCount + columnIndex;
                                const group = groups[index];

                                if (!group) return null;

                                return (
                                    <div style={{ ...style, padding: '0 12px', boxSizing: 'border-box' }}>
                                        <div className="h-full">
                                            <GroupCard
                                                group={group}
                                                roundMatches={roundMatches}
                                                onSelect={setSelectedGroupId}
                                                onEdit={openEditModal}
                                                onDelete={openDeleteModal}
                                                onChat={openChatModal}
                                                onInvite={openInviteModal}
                                            />
                                        </div>
                                    </div>
                                );
                            };

                            return (
                                <FixedSizeGrid
                                    columnCount={columnCount}
                                    columnWidth={columnWidth}
                                    rowCount={rowCount}
                                    rowHeight={280} // Increased to accommodate all card content and buttons
                                    height={height || 600}
                                    width={width || 800}
                                    style={{ overflowX: 'hidden' }}
                                >
                                    {Cell}
                                </FixedSizeGrid>
                            );
                        }}
                        />
                    </div>

                    {/* Pagination Controls */}
                    {totalGroups > 0 && (
                        <div className="flex items-center justify-between p-2">
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages} ({totalGroups} Groups)
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1 || isLoading}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="bg-transparent border-white/10 text-gray-400 hover:text-white"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages || isLoading}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="bg-transparent border-white/10 text-gray-400 hover:text-white"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ Dialogs are outside conditional view so they are ALWAYS rendered */}
            <EditGroupDialog open={isEditOpen} onOpenChange={setIsEditOpen} eventId={eventId} group={editingGroup} />

            <DeleteGroupDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} eventId={eventId} group={deletingGroup} />

            <GroupChatDialog
                open={isChatOpen}
                onOpenChange={setIsChatOpen}
                groupId={chatGroup?._id || null}
                groupName={chatGroup?.groupName || ""}
            />

            <AddTeamDialog
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                groupId={inviteGroup?._id || null}
                groupName={inviteGroup?.groupName || ""}
                eventId={eventId}
                isT1Special={activeRoundTab === 't1-special'}
            />

            <SubmitResultsDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                matchesPlayed={currentGroup?.matchesPlayed || 0}
                effectiveTotalMatch={effectiveTotalMatch}
                onConfirm={handleConfirmSubmit}
                isSaving={isSaving}
            />

            <MergeTeamToGroupDialog
                open={isMergeOpen}
                onOpenChange={setIsMergeOpen}
                eventId={eventId}
                team={mergeTeam}
                sourceRoundId={roundId}
            />
        </div>
    );
};
