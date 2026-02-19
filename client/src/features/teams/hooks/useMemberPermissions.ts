import { useMemo } from "react";

import { TeamMembersTypes } from "@/features/teams/lib/types";
import { TEAM_ROLES } from "@/features/teams/lib/access";
import { roleIcons } from "@/features/teams/ui/components/MemberCard";

interface UseMemberPermissionsProps {
    member: TeamMembersTypes;
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
        const isCurrentUser = member.user.toString() === currentUserId.toString();

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
