import { useMemo } from "react";

import { TeamMember } from "@/features/teams/lib/types";
import { TEAM_ROLES } from "@/features/teams/lib/access";
import { roleIcons } from "@/components/shared/list/MemberCard";

interface UseMemberPermissionsProps {
    member: TeamMember;
    isCaptain: boolean;
    owner: boolean;
    currentUserId: string;
}

export const useMemberPermissions = ({
    member,
    isCaptain,
    owner,
    currentUserId,
}: UseMemberPermissionsProps) => {
    return useMemo(() => {
        const isMemberOwner = member.systemRole === TEAM_ROLES.OWNER;
        const userId = typeof member.user === 'string' ? member.user : member.user?._id?.toString();
        const isCurrentUser = !!userId && !!currentUserId && userId === currentUserId.toString();

        const isRemovable =
            (isCaptain && !isCurrentUser) ||
            (owner &&
                !isCaptain &&
                member.systemRole === TEAM_ROLES.PLAYER &&
                !isCurrentUser);

        return {
            isMemberOwner,
            isCurrentUser,
            isRemovable,
            roleLabel: isMemberOwner ? "Team Captain" : undefined,
            roleIcon: isMemberOwner ? roleIcons.igl : undefined,
        };
    }, [member, isCaptain, owner, currentUserId]);
};
