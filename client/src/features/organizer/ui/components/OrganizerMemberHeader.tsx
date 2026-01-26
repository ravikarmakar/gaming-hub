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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-6 bg-[#0B0C1A] border-b border-white/10">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Organization Members</h1>
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
                    className="bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Members
                </Button>
            )}
        </div>
    );
};
