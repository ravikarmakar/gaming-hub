import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitMerge, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useGetRoundsQuery, useGetGroupsQuery, useInjectTeamMutation, Round } from "../../../hooks";

interface MergeTeamToGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    team: any;
    sourceRoundId: string;
}

export const MergeTeamToGroupDialog = ({ open, onOpenChange, eventId, team, sourceRoundId }: MergeTeamToGroupDialogProps) => {
    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const { data: rounds = [], isLoading: isLoadingRounds } = useGetRoundsQuery(eventId);
    
    // Filter out source round and t1-special rounds to only merge into actual tournament rounds
    const availableRounds = useMemo(() => {
        return rounds.filter(r => r._id !== sourceRoundId && (r.type as string) !== 't1-special' && !r.isPlaceholder);
    }, [rounds, sourceRoundId]);

    const { data: groupsData, isLoading: isLoadingGroups } = useGetGroupsQuery(selectedRoundId || "", 1, 100);
    const groups = groupsData?.groups || [];

    const { mutateAsync: injectTeam, isPending: isInjecting } = useInjectTeamMutation();

    const handleMerge = async () => {
        if (!selectedGroupId || !team) return;
        try {
            await injectTeam({
                groupId: selectedGroupId,
                teamId: team._id || team.teamId._id,
                eventId
            });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to merge team to group.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-gray-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <GitMerge className="w-5 h-5 text-blue-400" />
                        Merge Team to Main/Invited Round
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Select a target round and group to inject <strong className="text-white">{team?.teamName || "Selected Team"}</strong> into.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Round Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-black text-gray-500 uppercase tracking-widest">Select Target Round</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                            {isLoadingRounds ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto col-span-2" />
                            ) : availableRounds.length > 0 ? (
                                availableRounds.map((round: Round) => (
                                    <button
                                        key={round._id}
                                        onClick={() => {
                                            setSelectedRoundId(round._id);
                                            setSelectedGroupId(null);
                                        }}
                                        className={`p-3 rounded-xl border text-left transition-all ${
                                            selectedRoundId === round._id
                                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-300 shadow-lg shadow-blue-500/10'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="font-bold text-sm truncate">{round.roundName}</div>
                                        <div className="text-[10px] uppercase tracking-tighter opacity-60">
                                            {round.type === 'invited-tournament' ? 'Invited track' : 'Main track'}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-4 text-gray-500 text-sm italic">
                                    No active rounds available for merging.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Selection */}
                    {selectedRoundId && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label className="text-sm font-black text-gray-500 uppercase tracking-widest">Select Target Group</Label>
                            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                {isLoadingGroups ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto col-span-3" />
                                ) : groups.length > 0 ? (
                                    groups.map((group) => (
                                        <button
                                            key={group._id}
                                            onClick={() => setSelectedGroupId(group._id)}
                                            className={`p-3 rounded-lg border text-center transition-all ${
                                                selectedGroupId === group._id
                                                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                                                    : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                                            }`}
                                        >
                                            <div className="font-black text-xs">{group.groupName}</div>
                                            <div className="text-[10px] opacity-60">{(group.teams || []).length}/12 Teams</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-4 text-gray-500 text-sm italic">
                                        No groups found in this round.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        disabled={!selectedGroupId || isInjecting}
                        onClick={handleMerge}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                        {isInjecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitMerge className="w-4 h-4 mr-2" />}
                        Merge to Group
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
);
