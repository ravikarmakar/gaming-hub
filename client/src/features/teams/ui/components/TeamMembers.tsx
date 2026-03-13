import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { FixedSizeGrid } from "react-window";
import type { GridChildComponentProps } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

import { Skeleton } from "@/components/ui/skeleton";

import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { MemberCard, roleIcons, formatJoinedDate } from "@/components/shared/MemberCard";
import { TeamMembersTypes } from "@/features/teams/lib/types";
import { roleColors, roles } from "@/features/teams/lib/constants";
import { useMemberPermissions } from "../../hooks/useMemberPermissions";

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

interface ItemData {
  memberList: TeamMembersTypes[];
  columnCount: number;
  isCaptain: boolean;
  owner: boolean;
  currentUserId: string;
  editingMemberId: string | null;
  setEditingMemberId: (id: string | null) => void;
  onViewProfile: (id: string) => void;
  onEditRole: (role: string, id: string) => void;
  onRemove: (id: string) => void;
  isLoading?: boolean;
  allMembers: TeamMembersTypes[];
}

interface MemberCellContentProps {
  member: TeamMembersTypes;
  isCaptain: boolean;
  owner: boolean;
  currentUserId: string;
  editingMemberId: string | null;
  setEditingMemberId: (id: string | null) => void;
  onViewProfile: (id: string) => void;
  onEditRole: (role: string, id: string) => void;
  onRemove: (id: string) => void;
  isLoading?: boolean;
  allMembers: TeamMembersTypes[];
}

const MemberCellContent = React.memo(({
  member,
  isCaptain,
  owner,
  currentUserId,
  editingMemberId,
  setEditingMemberId,
  onViewProfile,
  onEditRole,
  onRemove,
  isLoading,
  allMembers,
}: MemberCellContentProps) => {
  const { isMemberOwner, isCurrentUser, isRemovable, roleLabel, roleIcon } = useMemberPermissions({
    member,
    isCaptain,
    owner,
    currentUserId,
  });

  const RoleIcon = roleIcons[member.roleInTeam];

  return (
    <MemberCard key={member.user} member={member} variant="team" isLoading={isLoading} className="h-full">
      {editingMemberId === member.user ? (
        <MemberCard.RoleSelector
          currentRole={member.roleInTeam}
          memberUser={member.user}
          allMembers={allMembers}
          roles={roles}
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
            roleLabel={roleLabel}
            roleIcon={roleIcon}
          />

          <MemberCard.Actions>
            <MemberCard.ProfileAction onClick={() => onViewProfile(member.user)} />
            {owner && (
              <MemberCard.Dropdown
                onEditRole={() => setEditingMemberId(member.user)}
                onRemove={() => onRemove(member.user)}
                isRemovable={isRemovable}
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
});

const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) => {
  const {
    memberList,
    columnCount,
    isCaptain,
    owner,
    currentUserId,
    editingMemberId,
    setEditingMemberId,
    onViewProfile,
    onEditRole,
    onRemove,
    isLoading,
    allMembers,
  } = data;

  const index = rowIndex * columnCount + columnIndex;
  const member = memberList[index];

  if (!member) return null;

  // Add padding to the style to simulate grid gap
  const cellStyle = {
    ...style,
    padding: "8px",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={cellStyle}>
      <MemberCellContent
        member={member}
        isCaptain={isCaptain}
        owner={owner}
        currentUserId={currentUserId}
        editingMemberId={editingMemberId}
        setEditingMemberId={setEditingMemberId}
        onViewProfile={onViewProfile}
        onEditRole={onEditRole}
        onRemove={onRemove}
        isLoading={isLoading}
        allMembers={allMembers}
      />
    </div>
  );
};

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
  const captainId = useTeamManagementStore((state) => state.currentTeam?.captain?.toString());
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Memoize filtered and sorted member lists for performance
  const combinedMembers = useMemo(() => {
    // Sort function: captain first
    return [...members].sort((a, b) => {
      if (a.user.toString() === captainId) return -1;
      if (b.user.toString() === captainId) return 1;
      return 0;
    });
  }, [members, captainId]);

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

  if (combinedMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0F111A]/40 backdrop-blur-xl">
        <div className="p-4 rounded-full bg-white/[0.03] mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-gray-300 font-medium mb-1">No members found</h3>
        <p className="text-gray-500 text-sm">There are no members in this team.</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <AutoSizer
        style={{ height: "auto" }}
        renderProp={({ width }) => {
          let columnCount = 1;
          if (width && width >= 1280) columnCount = 3;
          else if (width && width >= 768) columnCount = 2;

          const rowCount = Math.ceil(combinedMembers.length / columnCount);
          const columnWidth = width ? width / columnCount : 0;
          const gridHeight = rowCount * 210;

          const itemData: ItemData = {
            memberList: combinedMembers,
            columnCount,
            isCaptain,
            owner,
            currentUserId,
            editingMemberId,
            setEditingMemberId,
            onViewProfile,
            onEditRole,
            onRemove,
            isLoading,
            allMembers: members,
          };

          return (
            <div style={{ height: gridHeight, width: width ?? "100%" }}>
              <FixedSizeGrid
                columnCount={columnCount}
                columnWidth={columnWidth}
                rowCount={rowCount}
                rowHeight={210}
                height={gridHeight}
                width={width ?? 0}
                itemData={itemData}
                style={{ overflow: 'hidden' }}
              >
                {Cell}
              </FixedSizeGrid>
            </div>
          );
        }}
      />
    </div>
  );
};
