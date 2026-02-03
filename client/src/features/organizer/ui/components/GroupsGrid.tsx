
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Edit2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTournamentStore, Group } from "@/features/organizer/store/useTournamentStore";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface GroupsGridProps {
    roundId: string;
    eventId: string;
}

export const GroupsGrid = ({ roundId, eventId }: GroupsGridProps) => {
    const {
        groups,
        isLoading,
        fetchGroups,
        currentPage,
        totalPages,
        totalGroups,
        updateGroup,
        fetchLeaderboard,
        leaderboard,
        updateGroupResults,
        rounds
    } = useTournamentStore();

    // Check if group is completed
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // ✅ Memoized Selectors for performance
    const { currentGroup, effectiveTotalMatch, isGroupCompleted, roundMatches, currentRoundObject } = useMemo(() => {
        const round = rounds.find(r => r._id === roundId);
        const group = groups.find(g => g._id === selectedGroupId);
        const rm = round?.matchesPerGroup;
        const totalMatch = rm || group?.totalMatch || 1;
        return {
            currentGroup: group,
            effectiveTotalMatch: totalMatch,
            isGroupCompleted: group?.status === 'completed',
            roundMatches: rm,
            currentRoundObject: round
        };
    }, [rounds, groups, roundId, selectedGroupId]);

    // ✅ Batch Entry State
    const [isResultsMode, setIsResultsMode] = useState(false);
    const [tempResults, setTempResults] = useState<Record<string, { kills: number, rank: number }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Form State for Group Edit
    const [editName, setEditName] = useState("");
    const [editMatches, setEditMatches] = useState(1);
    const [editRoomId, setEditRoomId] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");

    const openEditModal = useCallback((group: Group) => {
        setEditingGroup(group);
        setEditName(group.groupName);
        setEditMatches(group.totalMatch);
        setEditRoomId(group.roomId?.toString() || "");
        setEditPassword(group.roomPassword?.toString() || "");

        // Format for datetime-local input (YYYY-MM-DDThh:mm)
        if (group.matchTime) {
            const date = new Date(group.matchTime);
            // Adjust for timezone to show local time in input
            const offset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date.getTime() - offset)).toISOString();
            setEditDate(localISOTime.split('T')[0]);
            setEditTime(localISOTime.split('T')[1].slice(0, 5));
        } else {
            setEditDate("");
            setEditTime("");
        }

        setIsEditOpen(true);
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

    const handleSaveGroup = async () => {
        if (!editingGroup) return;

        let combinedMatchTime = undefined;
        if (editDate && editTime) {
            combinedMatchTime = new Date(`${editDate}T${editTime}`).toISOString();
        }

        const success = await updateGroup(editingGroup._id, eventId, {
            groupName: editName,
            totalMatch: editMatches,
            roomId: editRoomId ? parseInt(editRoomId) : undefined,
            roomPassword: editPassword ? parseInt(editPassword) : undefined,
            matchTime: combinedMatchTime
        });

        if (success) {
            toast.success("Group updated!");
            setIsEditOpen(false);
            setEditingGroup(null);
            fetchGroups(roundId, currentPage);
        }
    };

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
        const success = await updateGroupResults(selectedGroupId, eventId, resultsArray);
        setIsSaving(false);

        if (success) {
            const currentMatch = (currentGroup.matchesPlayed || 0) + 1;
            const isFinalMatch = currentMatch >= effectiveTotalMatch;
            toast.success(isFinalMatch ? "Final results submitted! Group completed." : `Match ${currentMatch} results submitted!`);
            setIsResultsMode(false);
            fetchLeaderboard(selectedGroupId);
        }
    };

    useEffect(() => {
        if (roundId) {
            fetchGroups(roundId, currentPage);
        }
    }, [roundId, currentPage, fetchGroups]);

    // Fetch leaderboard when group is selected
    useEffect(() => {
        if (selectedGroupId) {
            fetchLeaderboard(selectedGroupId);
            setIsResultsMode(false);
        }
    }, [selectedGroupId, fetchLeaderboard]);


    const handlePageChange = useCallback((newPage: number) => {
        fetchGroups(roundId, newPage);
    }, [fetchGroups, roundId]);

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
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedGroupId(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Groups
                            </Button>
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                Group Details
                                {isGroupCompleted && (
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
                                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-black uppercase tracking-tighter">
                                            {leaderboard.teamScore.filter(t => t.isQualified).length} Qualified
                                        </Badge>
                                    </div>
                                )}
                            </h3>
                            {currentGroup?.matchTime && (
                                <span className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    Match Time: {new Date(currentGroup.matchTime).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* ✅ Qualification Stats */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Qualified:</span>
                                <span className={`text-sm font-bold ${leaderboard.teamScore.filter(t => t.isQualified).length === (rounds.find(r => r._id === roundId)?.qualifyingTeams || 0) ? 'text-green-400' : 'text-white'}`}>
                                    {leaderboard.teamScore.filter(t => t.isQualified).length} <span className="text-gray-500">/ {rounds.find(r => r._id === roundId)?.qualifyingTeams || 0}</span>
                                </span>
                            </div>

                            {/* ✅ Results Mode Toggle */}
                            {!isGroupCompleted && (
                                <div className="flex items-center gap-2">
                                    <Label className="text-gray-400 text-sm">
                                        {isResultsMode ? `Match ${(currentGroup?.matchesPlayed || 0) + 1} of ${effectiveTotalMatch}` : "Results Entry"}
                                    </Label>
                                    <Button
                                        size="sm"
                                        variant={isResultsMode ? "default" : "outline"}
                                        onClick={() => setIsResultsMode(!isResultsMode)}
                                        className={isResultsMode ? "bg-purple-600 hover:bg-purple-700" : "border-white/10 text-gray-400"}
                                    >
                                        {isResultsMode ? "Cancel" : "Enter Match Results"}
                                    </Button>
                                </div>
                            )}

                            {isResultsMode && (
                                <Button
                                    onClick={handleSubmitResults}
                                    disabled={isSaving}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit2 className="w-4 h-4 mr-2" />}
                                    Submit Results
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900/40 border border-white/5 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-200 uppercase bg-black/40 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-3">Rank</th>
                                        <th className="px-6 py-3">Team</th>
                                        <th className="px-6 py-3 text-center">Match Rank</th>
                                        <th className="px-6 py-3 text-center">Kills</th>
                                        <th className="px-6 py-3 text-center">Total Pts</th>
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
                    {/* ✅ Round Completion Summary */}
                    {currentRoundObject?.status === 'completed' && (
                        <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className="bg-purple-500 text-white border-transparent text-[10px] font-black uppercase">Round Finalized</Badge>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{currentRoundObject.roundName}</h3>
                                </div>
                                <p className="text-sm text-gray-400">This round has concluded. Teams listed below as <span className="text-purple-400 font-bold">"Q"</span> have advanced.</p>
                            </div>
                            <div className="flex items-center gap-8 bg-black/40 px-6 py-3 rounded-xl border border-white/5">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Groups</p>
                                    <p className="text-2xl font-black text-white">{currentRoundObject.groups?.length || 0}</p>
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest mb-1">Total Qualified</p>
                                    <p className="text-3xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                        {currentRoundObject.groups?.reduce((acc, g) => acc + (g.totalSelectedTeam || 0), 0) || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-white/5 bg-gray-900/40 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                            {groups.map((group) => (
                                <GroupCard
                                    key={group._id}
                                    group={group}
                                    roundMatches={roundMatches}
                                    onSelect={setSelectedGroupId}
                                    onEdit={openEditModal}
                                />
                            ))}
                        </div>
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
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-gray-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Group Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Matches</Label>
                            <Input
                                type="number"
                                value={editMatches}
                                onChange={(e) => setEditMatches(parseInt(e.target.value) || 1)}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Match Date</Label>
                            <Input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="col-span-3 bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Match Time</Label>
                            <Input
                                type="time"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="col-span-3 bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Room ID</Label>
                            <Input
                                type="number"
                                value={editRoomId}
                                onChange={(e) => setEditRoomId(e.target.value)}
                                placeholder="Enter Room ID"
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-gray-300">Password</Label>
                            <Input
                                type="number"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Enter Password"
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveGroup} className="bg-purple-600 hover:bg-purple-700">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ✅ Result Submission Confirmation Modal */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="max-w-md bg-[#1a1625] border-white/5 text-white">
                    <DialogHeader className="space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center tracking-tight">
                            {(currentGroup?.matchesPlayed || 0) + 1 >= effectiveTotalMatch ? "Final Submission" : "Submit Results"}
                        </DialogTitle>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                            <p className="text-gray-400 text-sm leading-relaxed text-center">
                                Are you sure about these results for <span className="text-white font-bold">Match {(currentGroup?.matchesPlayed || 0) + 1}</span> of {effectiveTotalMatch}?
                            </p>
                            {(currentGroup?.matchesPlayed || 0) + 1 >= effectiveTotalMatch ? (
                                <p className="text-amber-500/80 text-[11px] font-bold uppercase tracking-widest text-center">
                                    Final Match: Results will be locked
                                </p>
                            ) : (
                                <p className="text-blue-400/80 text-[11px] font-bold uppercase tracking-widest text-center">
                                    Match {(currentGroup?.matchesPlayed || 0) + 1} of {effectiveTotalMatch}
                                </p>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-red-200/60 leading-tight">
                                <span className="text-red-400 font-bold block mb-1">PLATFORM RULE</span>
                                Results cannot be edited once submitted. Please double-check all ranks and kill counts before confirming.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="grid grid-cols-2 gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setIsConfirmOpen(false)}
                            className="bg-white/5 hover:bg-white/10 text-gray-400"
                        >
                            Review Again
                        </Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            onClick={handleConfirmSubmit}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Submit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

interface GroupCardProps {
    group: Group;
    roundMatches?: number;
    onSelect: (id: string) => void;
    onEdit: (group: Group) => void;
}

const GroupCard = memo(({ group, roundMatches, onSelect, onEdit }: GroupCardProps) => {
    return (
        <div
            onClick={() => onSelect(group._id)}
            className="bg-black/40 border border-white/5 p-4 rounded-lg hover:border-purple-500/30 transition-colors group cursor-pointer"
        >
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-200">{group.groupName}</h4>
                    {group.status === 'completed' && (
                        <div className="flex items-center gap-1.5">
                            <Badge className="text-[10px] h-5 px-1.5 bg-green-500/20 text-green-400 border-green-500/30">
                                Done
                            </Badge>
                            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                {group.totalSelectedTeam || 0} Q
                            </span>
                        </div>
                    )}
                    {group.status === 'ongoing' && (
                        <Badge className="text-[10px] h-5 px-1.5 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse">
                            Live
                        </Badge>
                    )}
                    {(!group.status || group.status === 'pending') && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-gray-500 border-gray-700">
                            Pending
                        </Badge>
                    )}
                </div>
                {group.matchTime && (
                    <div className="text-[10px] text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {new Date(group.matchTime).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={group.status === 'completed'}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(group);
                        }}
                    >
                        <Edit2 className="w-3 h-3" />
                    </Button>
                    <Badge variant="secondary" className="text-[10px] bg-white/5 text-gray-400 group-hover:bg-purple-500/10 group-hover:text-purple-300">
                        {(group.teams || []).length} Teams
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-white/5 text-gray-500">
                        {group.matchesPlayed || 0} / {roundMatches || group.totalMatch} Matches
                    </Badge>
                </div>
            </div>

            <div className="space-y-1 mb-4">
                {group.teams?.slice(0, 3).map((team) => (
                    <div key={team._id} className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                        {team.teamName}
                    </div>
                ))}
                {(group.teams?.length || 0) > 3 && (
                    <div className="text-xs text-gray-600 pl-3.5">
                        + {(group.teams?.length || 0) - 3} more
                    </div>
                )}
            </div>

            <Button size="sm" className="w-full h-8 text-xs bg-white/5 hover:bg-white/10 text-gray-300">
                View Details
            </Button>
        </div>
    );
});

GroupCard.displayName = 'GroupCard';