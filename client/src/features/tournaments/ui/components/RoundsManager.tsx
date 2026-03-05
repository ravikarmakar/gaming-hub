
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { CreateRoundDialog } from "./dialogs/CreateRoundDialog";
import { RoundInfoDialog } from "./dialogs/RoundInfoDialog";
import { EditRoundDialog } from "./dialogs/EditRoundDialog";
import { DeleteRoundDialog } from "./dialogs/DeleteRoundDialog";
import { useGetRoundsQuery, useUpdateRoundStatusMutation, useCreateGroupsMutation } from "../../hooks";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GroupsGrid } from "./GroupsGrid";
import toast from "react-hot-toast";

interface RoundsManagerProps {
    eventId: string;
}

// -------------------------------------------------------------------------------------------------
// Actions Wrappers (Scoping dialog states locally to prevent RoundsManager re-renders)
// -------------------------------------------------------------------------------------------------

const CreateRoundAction = ({ eventId, isSidebarCollapsed, isCreateDisabled, canCreateRound, isGrandFinale }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className={isSidebarCollapsed ? "bg-purple-600 hover:bg-purple-700 text-white h-10 w-10 rounded-full shrink-0" : "w-full bg-purple-600 hover:bg-purple-700 text-white"}
                    size={isSidebarCollapsed ? "icon" : "default"}
                    disabled={isCreateDisabled}
                    title={isGrandFinale ? "Cannot create more rounds after Grand Finale (1 group)" : !canCreateRound ? "Complete the current round groups first" : "Create Round"}
                >
                    {isSidebarCollapsed ? (
                        <Plus className="w-5 h-5" />
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Round
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <CreateRoundDialog open={isOpen} onOpenChange={setIsOpen} eventId={eventId} />
        </Dialog>
    );
};

const DeleteRoundAction = ({ roundId, eventId, roundName, roundStatus, onDeleted }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsOpen(true)}
                disabled={roundStatus === 'completed'}
                title={roundStatus === 'completed' ? "Cannot delete completed round" : "Delete Round"}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
            <DeleteRoundDialog open={isOpen} onOpenChange={setIsOpen} roundId={roundId} eventId={eventId} roundName={roundName} onDeleted={onDeleted} />
        </>
    );
};

const EditRoundAction = ({ roundId, eventId, initialName }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setIsOpen(true)}
            >
                <Edit className="w-4 h-4" />
            </Button>
            <EditRoundDialog open={isOpen} onOpenChange={setIsOpen} roundId={roundId} eventId={eventId} initialName={initialName} />
        </>
    )
}

const RoundInfoAction = ({ round }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={() => setIsOpen(true)}
                title="Round Details"
            >
                <Info className="w-4 h-4" />
            </Button>
            <RoundInfoDialog open={isOpen} onOpenChange={setIsOpen} round={round} />
        </>
    )
}

const RoundItem = memo(({ round, isSelected, isSidebarCollapsed, onSelect }: {
    round: any,
    isSelected: boolean,
    isSidebarCollapsed: boolean,
    onSelect: (id: string) => void
}) => {
    return (
        <div
            onClick={() => onSelect(round._id)}
            className={`
                rounded-xl cursor-pointer transition-all border 
                ${isSidebarCollapsed ? "p-2 flex justify-center" : "p-4"}
                ${isSelected
                    ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-900/20'
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                }
            `}
            title={isSidebarCollapsed ? round.roundName : ""}
        >
            {isSidebarCollapsed ? (
                <div className="relative">
                    <span className={`font-bold text-sm ${isSelected ? 'text-purple-300' : 'text-gray-400'}`}>
                        R{round.roundNumber || "?"}
                    </span>
                    {round.status === 'ongoing' && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-green-500 animate-pulse border border-black" />
                    )}
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold ${isSelected ? 'text-purple-300' : 'text-gray-300'}`}>
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
    );
});

RoundItem.displayName = 'RoundItem';


export const RoundsManager = ({ eventId }: RoundsManagerProps) => {
    const { data: rounds = [], isLoading } = useGetRoundsQuery(eventId);
    const { mutateAsync: updateRoundStatus } = useUpdateRoundStatusMutation();
    const { mutateAsync: createGroups, isPending: isCreatingGroups } = useCreateGroupsMutation();

    const [isSavingStatus, setIsSavingStatus] = useState(false);

    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

    // ✅ Memoized derived state
    const { isGrandFinale, canCreateRound } = useMemo(() => {
        const latest = rounds.length > 0 ? rounds[rounds.length - 1] : null;
        const reflectsGrandFinale = latest?.groups && latest.groups.length === 1;
        const allGroupsDone = latest?.groups?.every(g => g.status === 'completed') ?? true;

        const canCreate = !latest || (
            !reflectsGrandFinale && (
                latest.status === 'completed' ||
                (latest.status === 'ongoing' && allGroupsDone)
            )
        );

        return {
            isGrandFinale: reflectsGrandFinale,
            canCreateRound: canCreate
        };
    }, [rounds]);


    const isCreateDisabled = !canCreateRound;

    // Derive selected round from store to ensure reactivity
    const selectedRound = useMemo(() => rounds.find(r => r._id === selectedRoundId) || null, [rounds, selectedRoundId]);



    useEffect(() => {
        if (rounds.length > 0 && !selectedRoundId) {
            // Default to the last round or the ongoing one
            const active = rounds.find(r => r.status === 'ongoing') || rounds[rounds.length - 1];
            setSelectedRoundId(active._id);
        }
    }, [rounds, selectedRoundId]);



    const handleCreateGroups = useCallback(async () => {
        if (!selectedRound || !eventId) return;
        try {
            await createGroups({ roundId: selectedRound._id, eventId });
            toast.success("Groups generation started!");
        } catch (error) {
            console.error(error);
        }
    }, [selectedRound, eventId, createGroups]);

    const handleCompleteRound = useCallback(async () => {
        if (!selectedRound || !eventId) return;
        setIsSavingStatus(true);
        try {
            await updateRoundStatus({ roundId: selectedRound._id, eventId, status: 'completed' });
            setIsSavingStatus(false);
            toast.success(`${selectedRound.roundName} marked as completed!`);
            if (isGrandFinale) {
                toast.success("Grand Finale completed! You can now finish the tournament.");
            }
        } catch (error) {
            console.error(error);
            setIsSavingStatus(false);
        }
    }, [selectedRound, updateRoundStatus, isGrandFinale]);


    // Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

                <div className={isSidebarCollapsed ? "px-2 flex justify-center" : "px-4"}>
                    <CreateRoundAction
                        eventId={eventId}
                        isSidebarCollapsed={isSidebarCollapsed}
                        isCreateDisabled={isCreateDisabled}
                        canCreateRound={canCreateRound}
                        isGrandFinale={isGrandFinale}
                    />
                </div>

                <div className="space-y-2 px-4 flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading && rounds.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                            {isSidebarCollapsed ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Loading..."}
                        </div>
                    ) : rounds.map((round) => (
                        <RoundItem
                            key={round._id}
                            round={round}
                            isSelected={selectedRoundId === round._id}
                            isSidebarCollapsed={isSidebarCollapsed}
                            onSelect={setSelectedRoundId}
                        />
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

                                    <RoundInfoAction round={selectedRound} />

                                    <EditRoundAction
                                        roundId={selectedRound._id}
                                        eventId={eventId}
                                        initialName={selectedRound.roundName}
                                    />

                                    <DeleteRoundAction
                                        roundId={selectedRound._id}
                                        eventId={eventId}
                                        roundName={selectedRound.roundName}
                                        roundStatus={selectedRound.status}
                                        onDeleted={() => setSelectedRoundId(null)}
                                    />
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
                                    onClick={() => { }}
                                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                                {selectedRound.status !== 'completed' && (!selectedRound.groups || selectedRound.groups.length === 0) && (
                                    <Button
                                        onClick={handleCreateGroups}
                                        disabled={isCreatingGroups}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        {isCreatingGroups ? (
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
                        <GroupsGrid roundId={selectedRound._id} eventId={eventId} />
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
