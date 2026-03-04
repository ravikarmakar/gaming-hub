import { UserPlus, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrganizerMemberHeaderProps {
    memberCount: number;
    onAddMember: () => void;
    canInvite: boolean;
    onLeave: () => void;
    canLeave: boolean;
}

export const OrganizerMemberHeader = ({
    memberCount,
    onAddMember,
    canInvite,
    onLeave,
    canLeave,
}: OrganizerMemberHeaderProps) => {
    return (
        <div className="flex flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Organization Members</h1>
                <Badge
                    variant="outline"
                    className="bg-white/5 border-white/10 text-gray-400"
                >
                    <Users className="w-3 h-3 mr-1" />
                    {memberCount}
                </Badge>
            </div>

            <div className="flex items-center gap-2">
                {canLeave && (
                    <Button
                        variant="ghost"
                        onClick={onLeave}
                        className="h-10 px-2 md:px-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-white/5 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Leave Organization</span>
                    </Button>
                )}

                {canInvite && (
                    <Button
                        onClick={onAddMember}
                        className="h-10 w-10 md:w-auto p-0 md:px-4 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center font-bold text-xs uppercase tracking-wider"
                    >
                        <UserPlus className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Invite Members</span>
                    </Button>
                )}
            </div>
        </div>
    );
};
