
import { useState, useEffect } from 'react';
import {
    Plus,
    RefreshCw,
    Trophy,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTournamentStore, Round } from "@/features/organizer/store/useTournamentStore";
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
        createGroups,
        isLoading,
        isCreating
    } = useTournamentStore();

    const [selectedRound, setSelectedRound] = useState<Round | null>(null);

    useEffect(() => {
        if (eventId) {
            fetchRounds(eventId);
        }
    }, [eventId, fetchRounds]);

    useEffect(() => {
        if (rounds.length > 0 && !selectedRound) {
            // Default to the last round or the ongoing one
            const active = rounds.find(r => r.status === 'ongoing') || rounds[rounds.length - 1];
            setSelectedRound(active);
        }
    }, [rounds, selectedRound]);

    const handleCreateRound = async () => {
        if (!eventId) return;
        const success = await createRound(eventId);
        if (success) {
            toast.success("New round created successfully!");
            fetchRounds(eventId); // Refresh list
        }
    };

    const handleCreateGroups = async () => {
        if (!selectedRound) return;
        const success = await createGroups(selectedRound._id);
        if (success) {
            toast.success("Groups generation started!");
        }
    };

    return (
        <div className="grid grid-cols-12 h-full min-h-[600px]">
            {/* Sidebar: Rounds List */}
            <div className="col-span-12 md:col-span-3 border-r border-white/5 p-4 space-y-4 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Rounds</h3>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCreateRound}
                        disabled={isCreating}
                        className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                </div>

                <div className="space-y-2">
                    {isLoading && rounds.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">Loading rounds...</div>
                    ) : rounds.map((round) => (
                        <div
                            key={round._id}
                            onClick={() => setSelectedRound(round)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedRound?._id === round._id
                                ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-900/20'
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold ${selectedRound?._id === round._id ? 'text-purple-300' : 'text-gray-300'}`}>
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
                        </div>
                    ))}
                    {!isLoading && rounds.length === 0 && (
                        <div className="text-sm text-gray-500 text-center">No rounds found. Create one to start.</div>
                    )}
                </div>
            </div>

            {/* Main Content: Groups Grid */}
            <div className="col-span-12 md:col-span-9 p-6">
                {selectedRound ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{selectedRound.roundName} Dashboard</h2>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                                        {selectedRound.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchRounds(eventId)}
                                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
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
