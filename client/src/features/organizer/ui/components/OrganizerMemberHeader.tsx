import { MemberListHeader } from "@/components/shared/MemberListHeader";

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
        <MemberListHeader
            title="Organization Members"
            memberCount={memberCount}
            onAddMember={onAddMember}
            canInvite={canInvite}
            onLeave={onLeave}
            canLeave={canLeave}
        />
    );
};
