import { Users, Loader2 } from "lucide-react";
import { OrganizerMemberCard } from "./OrganizerMemberCard";

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
    joinedDate?: string;
}

interface OrganizerMemberListProps {
    members: Member[];
    onRemove: (id: string) => void;
    onUpdateRole: (id: string, role: string) => Promise<void>;
    onViewProfile: (id: string) => void;
    onTransferOwnership?: (id: string) => void;
    canManage: boolean;
    canRemove: boolean;
    canTransfer?: boolean;
    currentUserId: string;
    isLoading: boolean;
}

export const OrganizerMemberList = ({
    members,
    onRemove,
    onUpdateRole,
    onViewProfile,
    onTransferOwnership,
    canManage,
    canRemove,
    canTransfer,
    currentUserId,
    isLoading,
}: OrganizerMemberListProps) => {

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-3" />
                <p className="text-gray-400 text-sm">Loading members...</p>
            </div>
        );
    }

    if (!members || members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <Users className="w-12 h-12 text-gray-600 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">No Members Found</h3>
                <p className="text-gray-400 text-sm">Your organization's roster is empty.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
                <OrganizerMemberCard
                    key={member._id}
                    member={member}
                    onRemove={onRemove}
                    onUpdateRole={onUpdateRole}
                    onViewProfile={onViewProfile}
                    onTransferOwnership={onTransferOwnership}
                    canManage={canManage}
                    canRemove={canRemove}
                    canTransfer={canTransfer}
                    isSelf={member._id === currentUserId}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
};
