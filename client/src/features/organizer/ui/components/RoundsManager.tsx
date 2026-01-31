
import { useState, useEffect } from 'react';
import {
    Plus,
    RefreshCw,
    Trophy,
    Loader2,
    Edit,
    Trash2,
    ChevronLeft,
    Info,
    CheckCircle2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTournamentStore } from "@/features/organizer/store/useTournamentStore";
import { GroupsGrid } from "./GroupsGrid";
import toast from "react-hot-toast";

interface RoundsManagerProps {
    eventId: string;
}

export const RoundsManager = ({ eventId }: RoundsManagerProps) => {
    const {
        rounds,
        fetchRounds,
        createRound,
        updateRoundStatus,
        createGroups,
        isLoading,
        isCreating,
        deleteRound,
    } = useTournamentStore();

    const [isSavingStatus, setIsSavingStatus] = useState(false);


    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
    const [isCreateRoundOpen, setIsCreateRoundOpen] = useState(false);
    const [isDeleteRoundOpen, setIsDeleteRoundOpen] = useState(false);
    const [newRoundName, setNewRoundName] = useState("");
    const [newStartTime, setNewStartTime] = useState("");
    const [newGapMinutes, setNewGapMinutes] = useState(30);
    const [newMatches, setNewMatches] = useState(1);
    const [newQualify, setNewQualify] = useState(1);

    // Edit Round State
    const [isEditRoundOpen, setIsEditRoundOpen] = useState(false);
    const [editRoundName, setEditRoundName] = useState("");

    // Derive selected round from store to ensure reactivity
    const selectedRound = rounds.find(r => r._id === selectedRoundId) || null;

    // Check if there is an ongoing round
    // Check if there is an ongoing or pending round, but allow if previous is completed
    // Logic: Disable if ANY round is "ongoing". Or if the *latest* round is not completed?
    // User requested: "disable round create button after complete the round one then if completed then enable"
    // Also user requested: "if in any round if we will only one grop means in this round is a grond file round sso need to dsiable to create round"
    const latestRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

    // Check if the latest round is a "Grand Finale" (only 1 group)
    const isGrandFinale = latestRound?.groups && latestRound.groups.length === 1;

    // Check if all groups in the latest round are completed
    const areAllGroupsCompleted = latestRound?.groups?.every(g => g.status === 'completed') ?? true;

    // Allow creation if:
    // 1. No rounds exist
    // 2. Latest round is NOT a grand finale AND (is explicitly marked 'completed' OR (is 'ongoing' AND all its groups are completed))
    const canCreateRound = !latestRound || (
        !isGrandFinale && (
            latestRound.status === 'completed' ||
            (latestRound.status === 'ongoing' && areAllGroupsCompleted)
        )
    );

    const isCreateDisabled = isCreating || !canCreateRound;

    useEffect(() => {
        if (eventId) {
            fetchRounds(eventId);
        }
    }, [eventId, fetchRounds]);

    useEffect(() => {
        if (rounds.length > 0 && !selectedRoundId) {
            // Default to the last round or the ongoing one
            const active = rounds.find(r => r.status === 'ongoing') || rounds[rounds.length - 1];
            setSelectedRoundId(active._id);
        }
    }, [rounds, selectedRoundId]);

    const handleCreateRound = async () => {
        if (!eventId) return;
        if (!newRoundName.trim()) {
            toast.error("Please enter a round name");
            return;
        }

        const success = await createRound(eventId, {
            roundName: newRoundName,
            startTime: newStartTime,
            gapMinutes: newGapMinutes,
            matchesPerGroup: newMatches,
            qualifyingTeams: newQualify
        });
        if (success) {
            toast.success("New round created successfully!");
            fetchRounds(eventId); // Refresh list
            setIsCreateRoundOpen(false);
            setNewRoundName("");
            setNewStartTime("");
            setNewGapMinutes(30);
        }
    };

    const handleCreateGroups = async () => {
        if (!selectedRound) return;
        const success = await createGroups(selectedRound._id);
        if (success) {
            toast.success("Groups generation started!");
        }
    };

    const handleCompleteRound = async () => {
        if (!selectedRound) return;
        setIsSavingStatus(true);
        const success = await updateRoundStatus(selectedRound._id, 'completed');
        setIsSavingStatus(false);
        if (success) {
            toast.success(`${selectedRound.roundName} marked as completed!`);
            // If it's the grand finale, maybe nudge them to finish the tournament
            if (isGrandFinale) {
                toast.success("Grand Finale completed! You can now finish the tournament.");
            }
        }
    };


    // Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    return (
        <div className="flex h-full min-h-[600px] overflow-hidden">
            {/* Sidebar: Rounds List */}
            <div
                className={`${isSidebarCollapsed ? "w-20" : "w-80 md:w-96"
                    } border-r border-white/5 space-y-4 bg-black/20 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col`}
            >
                <div className={`p-4 flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
                    {!isSidebarCollapsed && <h3 className="text-lg font-bold text-white">Rounds</h3>}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="text-gray-400 hover:text-white h-8 w-8"
                    >
                        {isSidebarCollapsed ? <Trophy className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                </div>

                {!isSidebarCollapsed && (
                    <div className="px-4">
                        <Dialog open={isCreateRoundOpen} onOpenChange={setIsCreateRoundOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                    disabled={isCreateDisabled}
                                    title={isGrandFinale ? "Cannot create more rounds after Grand Finale (1 group)" : !canCreateRound ? "Complete the current round groups first" : "Create Round"}
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Create Round
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>Create New Round</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Enter a name for this round (e.g., "Qualifiers", "Semi-Finals").
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right text-gray-300">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newRoundName}
                                            onChange={(e) => setNewRoundName(e.target.value)}
                                            className="col-span-3 bg-white/5 border-white/10 text-white focus:border-purple-500"
                                            placeholder="Round Name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right text-gray-300">Start Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={newStartTime}
                                            onChange={(e) => setNewStartTime(e.target.value)}
                                            className="col-span-3 bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right text-gray-300">Gap (Min)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={newGapMinutes}
                                            onChange={(e) => setNewGapMinutes(parseInt(e.target.value) || 0)}
                                            className="col-span-3 bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right text-gray-300">Matches</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={newMatches}
                                            onChange={(e) => setNewMatches(parseInt(e.target.value) || 1)}
                                            className="col-span-3 bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right text-gray-300">Qualify</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={newQualify}
                                            onChange={(e) => setNewQualify(parseInt(e.target.value) || 1)}
                                            className="col-span-3 bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCreateRound}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        disabled={isCreating}
                                    >
                                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Round
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                {isSidebarCollapsed && (
                    <div className="px-2 flex justify-center">
                        <Dialog open={isCreateRoundOpen} onOpenChange={setIsCreateRoundOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="bg-purple-600 hover:bg-purple-700 text-white h-10 w-10 rounded-full"
                                    disabled={isCreateDisabled}
                                    title={isGrandFinale ? "Cannot create more rounds after Grand Finale (1 group)" : !canCreateRound ? "Complete the current round groups first" : "Create Round"}
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-white/10 text-white">
                                {/* Same Dialog Content - duplicated for now or refactor to shared state triggered */}
                                {/* Since state is shared `isCreateRoundOpen`, duplication of Trigger is fine, Content must be outside or specific */}
                                {/* Actually, simpler to keep one Dialog at root level? No, Dialog is coupled with Button usually. 
                                    I will reuse the state `isCreateRoundOpen`. 
                                    To avoid duplication of huge Dialog content code, I will move DialogContent OUTSIDE the conditional sidebars 
                                    and just have hidden trigger or programmatic open? 
                                    Better: Keep it simple. Just duplicate trigger logic or move content out.
                                    Moving Content OUT creates cleaner code.
                                */}
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                <div className="space-y-2 px-4 flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading && rounds.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                            {isSidebarCollapsed ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Loading..."}
                        </div>
                    ) : rounds.map((round) => (
                        <div
                            key={round._id}
                            onClick={() => setSelectedRoundId(round._id)}
                            className={`
                                rounded-xl cursor-pointer transition-all border 
                                ${isSidebarCollapsed ? "p-2 flex justify-center" : "p-4"}
                                ${selectedRoundId === round._id
                                    ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-900/20'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                }
                            `}
                            title={isSidebarCollapsed ? round.roundName : ""}
                        >
                            {isSidebarCollapsed ? (
                                <div className="relative">
                                    <span className={`font-bold text-sm ${selectedRoundId === round._id ? 'text-purple-300' : 'text-gray-400'}`}>
                                        R{round.roundNumber || "?"}
                                    </span>
                                    {round.status === 'ongoing' && (
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-green-500 animate-pulse border border-black" />
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`font-bold ${selectedRoundId === round._id ? 'text-purple-300' : 'text-gray-300'}`}>
                                            {round.roundName}
                                        </span>
                                        {round.status === 'ongoing' && (
                                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Trophy className="w-3 h-3" /> {round.groups?.length || 0} Groups
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {!isLoading && rounds.length === 0 && (
                        <div className="text-sm text-gray-500 text-center">
                            {isSidebarCollapsed ? "Empty" : "No rounds found."}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content: Groups Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
                {/* ... existing content ... */}
                {selectedRound ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedRound.roundName} Dashboard</h2>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                        onClick={() => setIsInfoOpen(true)}
                                        title="Round Details"
                                    >
                                        <Info className="w-4 h-4" />
                                    </Button>

                                    <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                                        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Info className="w-5 h-5 text-blue-400" />
                                                    Round Information
                                                </DialogTitle>
                                                <DialogDescription className="text-gray-400">
                                                    Configuration details and qualification criteria for {selectedRound.roundName}.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid grid-cols-2 gap-4 py-4">
                                                <div className="bg-white/5 p-4 rounded-lg space-y-1">
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Start Time</span>
                                                    <div className="font-medium text-white">
                                                        {selectedRound.startTime ? new Date(selectedRound.startTime).toLocaleString() : 'Not scheduled'}
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-4 rounded-lg space-y-1">
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Gap Between Matches</span>
                                                    <div className="font-medium text-white">
                                                        {selectedRound.gapMinutes || 0} Minutes
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-4 rounded-lg space-y-1">
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Total Groups</span>
                                                    <div className="font-bold text-lg text-white">
                                                        {(selectedRound.groups || []).length} Groups
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-4 rounded-lg space-y-1">
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Total Teams</span>
                                                    <div className="font-bold text-lg text-white">
                                                        {(selectedRound.groups || []).reduce((acc, g) => acc + (g.teams?.length || 0), 0)} Teams
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-4 rounded-lg space-y-1">
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Matches / Group</span>
                                                    <div className="font-medium text-white">
                                                        {selectedRound.matchesPerGroup || 1} Matches
                                                    </div>
                                                </div>

                                                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg space-y-1">
                                                    <span className="text-xs text-purple-300 uppercase tracking-wider flex items-center gap-1">
                                                        <Trophy className="w-3 h-3" /> Qualification
                                                    </span>
                                                    <div className="font-bold text-lg text-white">
                                                        Top {selectedRound.qualifyingTeams || "N/A"} Teams
                                                    </div>
                                                    <p className="text-xs text-purple-300/70">
                                                        Advance to the next round based on total points.
                                                    </p>
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button onClick={() => setIsInfoOpen(false)} className="w-full bg-white/10 hover:bg-white/20 text-white">
                                                    Close
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-400 hover:text-white"
                                        onClick={() => {
                                            setEditRoundName(selectedRound.roundName);
                                            setIsEditRoundOpen(true);
                                        }}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setIsDeleteRoundOpen(true)}
                                        disabled={selectedRound.status === 'completed'}
                                        title={selectedRound.status === 'completed' ? "Cannot delete completed round" : "Delete Round"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>

                                    {/* Delete Confirmation Dialog */}
                                    <Dialog open={isDeleteRoundOpen} onOpenChange={setIsDeleteRoundOpen}>
                                        <DialogContent className="bg-gray-900 border-white/10 text-white">
                                            <DialogHeader>
                                                <DialogTitle className="text-red-400">Delete Round?</DialogTitle>
                                                <DialogDescription className="text-gray-400">
                                                    Are you sure you want to delete <strong>{selectedRound.roundName}</strong>?
                                                    This will permanently delete all groups and leaderboards associated with this round.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="mt-4">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setIsDeleteRoundOpen(false)}
                                                    className="hover:bg-white/5"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        const success = await deleteRound(selectedRound._id);
                                                        if (success) {
                                                            toast.success("Round deleted successfully");
                                                            setIsDeleteRoundOpen(false);
                                                            setSelectedRoundId(null); // Deselect
                                                        }
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Delete Round
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Edit Dialog */}
                                    <Dialog open={isEditRoundOpen} onOpenChange={setIsEditRoundOpen}>
                                        <DialogContent className="bg-gray-900 border-white/10 text-white">
                                            <DialogHeader>
                                                <DialogTitle>Edit Round Name</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <Input
                                                    value={editRoundName}
                                                    onChange={(e) => setEditRoundName(e.target.value)}
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    onClick={async () => {
                                                        if (selectedRound && editRoundName.trim()) {
                                                            const success = await useTournamentStore.getState().updateRound(selectedRound._id, editRoundName);
                                                            if (success) {
                                                                toast.success("Round updated!");
                                                                setIsEditRoundOpen(false);
                                                                // Update local selected round object or wait for store to propagate? 
                                                                // Store updates rounds array, but selectedRound is local state.
                                                                // Better to update selectedRound or let effect sync it.
                                                                // setSelectedRound(prev => prev ? ({ ...prev, roundName: editRoundName }) : null);
                                                                // Derived state handles this automatically!
                                                            }
                                                        }
                                                    }}
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                >
                                                    Save Changes
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                                        {selectedRound.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {selectedRound.status !== 'completed' && (
                                    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Progress</span>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-bold text-white">
                                                    {(selectedRound.groups || []).filter(g => g.status === 'completed').length} / {(selectedRound.groups || []).length}
                                                </div>
                                                <span className="text-[10px] text-gray-500 italic">Groups Done</span>
                                            </div>
                                        </div>

                                        {(selectedRound.groups || []).length > 0 &&
                                            (selectedRound.groups || []).every(g => g.status === 'completed') && (
                                                <Button
                                                    size="sm"
                                                    onClick={handleCompleteRound}
                                                    disabled={isSavingStatus}
                                                    className="bg-green-600 hover:bg-green-700 text-white h-9 px-4 animate-bounce hover:animate-none"
                                                >
                                                    {isSavingStatus ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    )}
                                                    Complete Round
                                                </Button>
                                            )}
                                    </div>
                                )}


                                <Button
                                    variant="outline"
                                    onClick={() => fetchRounds(eventId)}
                                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                                {selectedRound.status !== 'completed' && (!selectedRound.groups || selectedRound.groups.length === 0) && (
                                    <Button
                                        onClick={handleCreateGroups}
                                        disabled={isCreating}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        {isCreating ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4 mr-2" />
                                        )}
                                        Create Groups
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Groups Grid */}
                        <GroupsGrid roundId={selectedRound._id} />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        Select a round to view details
                    </div>
                )}
            </div>
        </div>
    );
};