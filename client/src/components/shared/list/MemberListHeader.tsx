import { Users, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberListHeaderProps {
    title: string;
    memberCount: number;
    onAddMember?: () => void;
    canInvite?: boolean;
    onLeave?: () => void;
    canLeave?: boolean;
}

export const MemberListHeader = ({
    title,
    memberCount,
    onAddMember,
    canInvite,
    onLeave,
    canLeave,
}: MemberListHeaderProps) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                    <p className="text-gray-400 text-sm font-medium mt-0.5">
                        {memberCount} {memberCount === 1 ? 'member' : 'members'} active in roster
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {canInvite && onAddMember && (
                    <Button
                        onClick={onAddMember}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-lg shadow-purple-900/20"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                    </Button>
                )}
                {canLeave && onLeave && (
                    <Button
                        variant="ghost"
                        onClick={onLeave}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave
                    </Button>
                )}
            </div>
        </div>
    );
};
