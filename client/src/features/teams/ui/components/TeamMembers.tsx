import { useMemo, useState } from "react";
import { Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { MemberCard, roleIcons, formatJoinedDate } from "@/features/teams/ui/components/MemberCard";
import { TeamMembersTypes } from "@/features/teams/lib/types";
import { roleColors } from "@/features/teams/lib/constants";
import { TEAM_ROLES } from "@/features/teams/lib/access";

interface TeamMembersProps {
  members: TeamMembersTypes[];
  owner: boolean;
  isCaptain: boolean;
  currentUserId: string;
  onRemove: (id: string) => void;
  onEditRole: (role: string, id: string) => void;
  onViewProfile: (id: string) => void;
  isLoading?: boolean;
}

export const TeamMembers = ({
  members,
  owner,
  isCaptain,
  currentUserId,
  onRemove,
  onEditRole,
  onViewProfile,
  isLoading,
}: TeamMembersProps) => {
  const { currentTeam } = useTeamManagementStore();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Memoize filtered and sorted member lists for performance
  const { activeMembers, inactiveMembers } = useMemo(() => {
    const captainId = currentTeam?.captain?.toString();

    // Sort function: captain first
    const sortedMembers = [...members].sort((a, b) => {
      if (a.user.toString() === captainId) return -1;
      if (b.user.toString() === captainId) return 1;
      return 0;
    });

    const active = sortedMembers.filter((m) => m.isActive);
    const inactive = sortedMembers.filter((m) => !m.isActive);
    return { activeMembers: active, inactiveMembers: inactive };
  }, [members, currentTeam?.captain]);

  if (isLoading && members.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-[200px] bg-[#0F111A]/60 border border-white/10 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const renderMemberGrid = (memberList: TeamMembersTypes[]) => {
    if (memberList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0F111A]/40 backdrop-blur-xl">
          <div className="p-4 rounded-full bg-white/[0.03] mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-300 font-medium mb-1">No members found</h3>
          <p className="text-gray-500 text-sm">There are no members in this category.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {memberList.map((member) => {
          const isMemberOwner = member.systemRole === TEAM_ROLES.OWNER;
          const isCurrentUser = member.user === currentUserId;
          const RoleIcon = roleIcons[member.roleInTeam];

          return (
            <MemberCard key={member.user} member={member} isLoading={isLoading}>
              {editingMemberId === member.user ? (
                <MemberCard.RoleSelector
                  currentRole={member.roleInTeam}
                  memberUser={member.user}
                  allMembers={members}
                  onCancel={() => setEditingMemberId(null)}
                  onSave={(role) => {
                    onEditRole(role, member.user);
                    setEditingMemberId(null);
                  }}
                />
              ) : (
                <>
                  <MemberCard.Header
                    isCurrentUser={isCurrentUser}
                    roleLabel={isMemberOwner ? "Team Captain" : undefined}
                    roleIcon={isMemberOwner ? roleIcons.igl : undefined}
                  />

                  <MemberCard.Actions>
                    <MemberCard.ProfileAction onClick={() => onViewProfile(member.user)} />
                    {owner && (
                      <MemberCard.Dropdown
                        onEditRole={() => setEditingMemberId(member.user)}
                        onRemove={() => onRemove(member.user)}
                        isRemovable={
                          // Captain can remove anyone except themselves
                          (isCaptain && !isCurrentUser) ||
                          // Managers can remove members who only have the 'player' role
                          (owner && !isCaptain && member.systemRole === TEAM_ROLES.PLAYER && !isCurrentUser)
                        }
                        isLoading={isLoading}
                      />
                    )}
                  </MemberCard.Actions>

                  <MemberCard.InfoGrid>
                    <MemberCard.InfoItem
                      label="Role"
                      value={member.roleInTeam.charAt(0).toUpperCase() + member.roleInTeam.slice(1)}
                      icon={RoleIcon}
                      valueClassName={roleColors[member.roleInTeam]?.split(' ')[1]}
                    />
                    <MemberCard.InfoItem
                      label="Status"
                      value={member.isActive ? "Active" : "Inactive"}
                      statusDot
                      active={member.isActive}
                      valueClassName={member.isActive ? "text-emerald-400" : "text-gray-400"}
                    />
                    {!isMemberOwner && (
                      <div className="col-span-2 mt-1">
                        <span className="text-[10px] text-gray-500">Joined at: {formatJoinedDate(member.joinedAt)}</span>
                      </div>
                    )}
                  </MemberCard.InfoGrid>
                </>
              )}
            </MemberCard>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mt-0">
        {renderMemberGrid([...activeMembers, ...inactiveMembers])}
      </div>
    </div>
  );
};
