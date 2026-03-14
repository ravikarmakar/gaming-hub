import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { useSearchTeamsQuery, useGetT1SpecialTeamsQuery } from "../../../hooks/useTournamentQueries";
import { useInviteToGroupMutation } from "../../../hooks/useTournamentMutations";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';

interface AddTeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string | null;
    groupName: string;
    eventId: string;
    isT1Special?: boolean;
}

export const AddTeamDialog = ({ open, onOpenChange, groupId, groupName, eventId, isT1Special }: AddTeamDialogProps) => {
    const [invitedTeams, setInvitedTeams] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    // Reset state when dialog opens or group changes
    useEffect(() => {
        if (open) {
            setSearch("");
            setInvitedTeams([]);
        }
    }, [open, groupId, eventId]);

    const { data: searchTeams = [], isLoading: isSearching } = useSearchTeamsQuery(search);
    const { data: t1Teams = [], isLoading: isLoadingT1 } = useGetT1SpecialTeamsQuery(eventId, search);
    
    const teams = isT1Special ? t1Teams : searchTeams;
    const isLoading = isT1Special ? isLoadingT1 : isSearching;

    const { mutateAsync: inviteTeam, isPending: isInviting } = useInviteToGroupMutation();

    const handleInvite = async (team: any) => {
        if (!groupId) return;
        try {
            await inviteTeam({
                targetId: groupId,
                playerId: team.captain,
                targetModel: "Group"
            });
            setInvitedTeams(prev => [...prev, team._id]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to send invitation. Please try again.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-gray-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                        Invite Team to {groupName}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Search for a team captain to invite their team to this group.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search team name or tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50 h-11"
                        />
                    </div>

                    <div className="h-[300px] pr-4 overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                                </div>
                            ) : teams.length > 0 ? (
                                teams.map((team: any) => (
                                    <div 
                                        key={team._id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {team.imageUrl ? (
                                                <img src={team.imageUrl} alt={team.teamName || "Team"} className="w-10 h-10 rounded-full object-cover bg-gray-900" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {(team.teamName || "??").substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">{team.teamName}</span>
                                                    {team.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] h-4 border-white/10 text-gray-500">
                                                        {team.tag}
                                                    </Badge>
                                                    <span className="text-[10px] text-gray-500">{team.region}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant={invitedTeams.includes(team._id) ? "ghost" : "default"}
                                            disabled={isInviting || invitedTeams.includes(team._id)}
                                            onClick={() => handleInvite(team)}
                                            className={invitedTeams.includes(team._id) 
                                                ? "text-green-400 bg-green-500/10 hover:bg-green-500/10" 
                                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                            }
                                        >
                                            {invitedTeams.includes(team._id) ? "Invited" : "Invite"}
                                        </Button>
                                    </div>
                                ))
                            ) : search.length >= 2 ? (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    No teams found matching "{search}"
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    Enter at least 2 characters to search...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-white">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
