import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { useGetOrgByIdQuery } from "@/features/organizer/hooks/useOrganizerQueries";
import { useManageOrgMembers } from "@/features/organizer/hooks/useManageOrgMembers";
import { OrganizerUserSearch } from "@/features/organizer/ui/components/OrganizerUserSearch";
import { OrganizerInviteDialog } from "@/features/organizer/ui/components/OrganizerInviteDialog";
import { OrganizerPendingInvites } from "@/features/organizer/ui/components/OrganizerPendingInvites";
import { OrganizerMemberHeader } from "../components/OrganizerMemberHeader";
import { OrganizerMemberList } from "../components/OrganizerMemberList";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "../../lib/access";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";
import { ChatWindow } from "@/features/teams/ui/components/ChatWindow";

const OrganizerMemberPage = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { user } = useAuthStore();
  const { can } = useAccess();

  const {
    data: orgData,
    isLoading,
  } = useGetOrgByIdQuery(user?.orgId as string, page, 20, searchQuery, {
    enabled: !!user?.orgId,
  });

  const currentOrg = orgData?.data;
  const memberPagination = orgData?.pagination;

  // Role priority mapping for sorting
  const rolePriority: Record<string, number> = {
    "org:owner": 1,
    "org:co_owner": 2,
    "org:manager": 3,
    "org:staff": 4,
  };

  const sortedMembers = React.useMemo(() => {
    if (!currentOrg?.members) return [];
    return [...currentOrg.members].sort((a, b) => {
      const priorityA = rolePriority[a.role] || 99;
      const priorityB = rolePriority[b.role] || 99;
      return priorityA - priorityB;
    });
  }, [currentOrg?.members]);

  const {
    handleAddSelectedMembers,
    handleStaffRemove,
    handleLeaveOrg,
    handleUpdateRole,
    handleTransferOwnership,
    isAddingStaff,
    pendingMemberId,
  } = useManageOrgMembers(currentOrg?._id);

  // RBAC
  const canInvite = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.inviteMember]);
  const canRemove = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.removeMember]);
  const canUpdateRole = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.updateRole]);
  const canTransfer = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.transferOwnership]);
  const canLeave = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.leaveOrg]);

  const handleViewProfile = (id: string) => {
    navigate(PLAYER_ROUTES.PLAYER_DETAILS.replace(":id", id));
  };

  return (
    <div className="space-y-6">
      <OrganizerMemberHeader
        memberCount={currentOrg?.members?.length || 0}
        onAddMember={() => setIsInviteOpen(true)}
        canInvite={canInvite}
        onLeave={handleLeaveOrg}
        canLeave={canLeave}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrganizerMemberList
            members={sortedMembers}
            onRemove={handleStaffRemove}
            onUpdateRole={handleUpdateRole}
            onViewProfile={handleViewProfile}
            onTransferOwnership={handleTransferOwnership}
            onLeave={handleLeaveOrg}
            canManage={canUpdateRole}
            canRemove={canRemove}
            canTransfer={canTransfer}
            currentUserId={user?._id ?? ""}
            isLoading={isLoading}
            actionPendingId={pendingMemberId}
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setPage(1); // Reset to page 1 on search
            }}
            pagination={memberPagination || { total: 0, page: 1, limit: 20, pages: 1 }}
            onPageChange={setPage}
          />
          {currentOrg?._id && <OrganizerPendingInvites orgId={currentOrg._id} />}
        </div>

        {currentOrg?._id && (
          <div className="lg:col-span-1 h-[600px] sticky top-6 bg-[#0F111A]/40 border border-white/10 rounded-2xl backdrop-blur-xl p-6 overflow-hidden flex flex-col">
            <ChatWindow
              targetId={currentOrg._id}
              targetName={currentOrg.name}
              scope="organizer"
              canDeleteParent={canUpdateRole}
            />
          </div>
        )}
      </div>

      <OrganizerUserSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onAddSelected={handleAddSelectedMembers}
        isLoading={isLoading || isAddingStaff}
        existingMemberIds={currentOrg?.members?.map((m) => m._id) || []}
      />

      {currentOrg?._id && (
        <OrganizerInviteDialog
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          orgId={currentOrg._id}
        />
      )}
    </div>
  );
};

export default OrganizerMemberPage;
