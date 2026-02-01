import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrganizerMemberHeaderProps {
    memberCount: number;
    onAddMember: () => void;
    canInvite: boolean;
}

export const OrganizerMemberHeader = ({
    memberCount,
    onAddMember,
    canInvite,
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

            {canInvite && (
                <Button
                    onClick={onAddMember}
                    className="h-10 w-10 md:w-auto p-0 md:px-4 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center"
                >
                    <UserPlus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Invite Members</span>
                </Button>
            )}
        </div>
    );
};
