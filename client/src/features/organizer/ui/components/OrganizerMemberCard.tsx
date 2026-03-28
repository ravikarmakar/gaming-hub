import { useState, memo } from "react";
import { format } from "date-fns";
import {
    Calendar,
    ShieldAlert,
    ShieldCheck,
    Shield,
    ShieldQuestion
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MemberCard } from "@/components/shared/list/MemberCard";
import { ORG_ROLE } from "../../lib/access";

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
    joinedDate?: string;
}

interface OrganizerMemberCardProps {
    member: Member;
    onRemove: (id: string) => void;
    onUpdateRole: (id: string, role: string) => void;
    onViewProfile: (id: string) => void;
    onTransferOwnership?: (id: string) => void;
    onLeave?: () => void;
    canManage: boolean;
    canRemove: boolean;
    canTransfer?: boolean;
    canLeave?: boolean;
    isSelf: boolean;
    isLoading: boolean;
}

const roles = [
    { label: "Co-Owner", value: ORG_ROLE.CO_OWNER },
    { label: "Manager", value: ORG_ROLE.MANAGER },
    { label: "Staff", value: ORG_ROLE.STAFF },
];

export const OrganizerMemberCard = memo(({
    member,
    onRemove,
    onUpdateRole,
    onViewProfile,
    onTransferOwnership,
    onLeave,
    canManage,
    canRemove,
    canTransfer,
    canLeave,
    isSelf,
    isLoading,
}: OrganizerMemberCardProps) => {
    const [isEditingRole, setIsEditingRole] = useState(false);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case ORG_ROLE.OWNER:
                return (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Owner
                    </Badge>
                );
            case ORG_ROLE.CO_OWNER:
                return (
                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Co-Owner
                    </Badge>
                );
            case ORG_ROLE.MANAGER:
                return (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        <Shield className="w-3 h-3 mr-1" /> Manager
                    </Badge>
                );
            case ORG_ROLE.STAFF:
                return (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        <ShieldQuestion className="w-3 h-3 mr-1" /> Staff
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-gray-400 border-gray-800">Member</Badge>;
        }
    };

    return (
        <MemberCard member={member} variant="organizer" isLoading={isLoading}>
            <MemberCard.Header
                isCurrentUser={isSelf}
                subText={member.email}
            />

            <MemberCard.Actions>
                {!isSelf && (
                    <MemberCard.ProfileAction onClick={() => onViewProfile(member._id)} />
                )}

                {(!isSelf && (canManage || canRemove || canTransfer) && member.role !== ORG_ROLE.OWNER) && (
                    <MemberCard.Dropdown
                        onEditRole={canManage ? () => setIsEditingRole(true) : undefined}
                        onRemove={canRemove ? () => onRemove(member._id) : undefined}
                        onTransferOwnership={(canTransfer && onTransferOwnership) ? () => onTransferOwnership(member._id) : undefined}
                        isRemovable={canRemove}
                        isLoading={isLoading}
                        canTransfer={canTransfer}
                    />
                )}

                {(isSelf && canLeave) && (
                    <MemberCard.Dropdown
                        onLeave={onLeave ? () => onLeave() : undefined}
                        canLeave={canLeave}
                    />
                )}
            </MemberCard.Actions>

            <MemberCard.InfoGrid>
                {isEditingRole ? (
                    <MemberCard.RoleSelector
                        currentRole={member.role}
                        onSave={(role) => {
                            if (role !== member.role) {
                                onUpdateRole(member._id, role);
                            }
                            setIsEditingRole(false);
                        }}
                        onCancel={() => setIsEditingRole(false)}
                        allMembers={[]}
                        memberUser={member._id}
                        roles={roles}
                    />
                ) : (
                    <MemberCard.InfoItem
                        label="Role"
                        value={getRoleBadge(member.role)}
                    />
                )}

                <MemberCard.InfoItem
                    label="Joined"
                    value={member.joinedDate ? format(new Date(member.joinedDate), "MMM dd, yyyy") : "Recently"}
                    icon={Calendar}
                />
            </MemberCard.InfoGrid>
        </MemberCard>
    );
});

OrganizerMemberCard.displayName = "OrganizerMemberCard";
