import { OrganizerMemberCard } from "./OrganizerMemberCard";
import { MemberList } from "@/components/shared/MemberList";

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
    onUpdateRole: (id: string, role: string) => void;
    onViewProfile: (id: string) => void;
    onTransferOwnership?: (id: string) => void;
    onLeave?: () => void;
    canManage: boolean;
    canRemove: boolean;
    canTransfer?: boolean;
    canLeave?: boolean;
    currentUserId: string;
    isLoading: boolean;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    pagination?: { total: number; page: number; limit: number; pages: number } | null;
    onPageChange?: (page: number) => void;
    actionPendingId?: string | null;
}

export const OrganizerMemberList = ({
    members,
    onRemove,
    onUpdateRole,
    onViewProfile,
    onTransferOwnership,
    onLeave,
    canManage,
    canRemove,
    canTransfer,
    currentUserId,
    canLeave,
    isLoading,
    searchQuery = "",
    onSearchChange,
    pagination,
    onPageChange,
    actionPendingId,
}: OrganizerMemberListProps) => {

    return (
        <MemberList
            items={members}
            keyExtractor={(member) => member._id}
            renderItem={(member) => (
                <OrganizerMemberCard
                    member={member}
                    onRemove={onRemove}
                    onUpdateRole={onUpdateRole}
                    onViewProfile={onViewProfile}
                    onTransferOwnership={onTransferOwnership}
                    onLeave={onLeave}
                    canManage={canManage}
                    canRemove={canRemove}
                    canTransfer={canTransfer}
                    canLeave={canLeave}
                    isSelf={member._id === currentUserId}
                    isLoading={actionPendingId === member._id}
                />
            )}
            showSearch={true}
            searchPlaceholder="Search by username..."
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            isLoading={isLoading}
            emptyTitle="No Members Found"
            emptyDescription={searchQuery
                ? `No members found matching "${searchQuery}".`
                : "Your organization's roster is currently empty."
            }
            pagination={pagination}
            onPageChange={onPageChange}
        />
    );
};

