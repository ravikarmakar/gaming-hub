import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { useGetOrgByIdQuery } from "@/features/organizer/hooks/useOrganizerQueries";
import { OrganizerUserSearch } from "@/features/organizer/ui/components/OrganizerUserSearch";
import { OrganizerInviteDialog } from "@/features/organizer/ui/components/OrganizerInviteDialog";
import { OrganizerPendingInvites } from "@/features/organizer/ui/components/OrganizerPendingInvites";
import { OrganizerMemberHeader } from "../components/OrganizerMemberHeader";
import { OrganizerMemberList } from "../components/OrganizerMemberList";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "../../lib/access";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";

const OrganizerMemberPage = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const {
    addStaffs,
    removeStaff,
    updateStaffRole,
    transferOwnership,
  } = useOrganizerStore();

  const { user } = useAuthStore();
  const { can } = useAccess();

  const {
    data: orgData,
    isLoading,
    error,
    refetch,
  } = useGetOrgByIdQuery(user?.orgId as string, page, 20, searchQuery, {
    enabled: !!user?.orgId,
  });

  const currentOrg = orgData?.data;
  const memberPagination = orgData?.pagination;

  // RBAC
  const canInvite = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.inviteMember]);
  const canRemove = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.removeMember]);
  const canUpdateRole = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.updateRole]);
  const canTransfer = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.transferOwnership]);

  const handleAddSelectedMembers = async (ids: string[]) => {
    const result = await addStaffs({ staff: ids });
    if (result) {
      if (currentOrg?._id) await refetch();
      toast.success("Members added successfully!");
    } else {
      toast.error(error?.message || "Failed to add members");
    }
  };

  const handleStaffRemove = async (id: string) => {
    const success = await removeStaff(id);
    if (success) {
      await refetch();
      toast.success("Staff removed successfully");
    } else {
      toast.error(error?.message || "Failed to remove staff");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    const success = await updateStaffRole(memberId, newRole);
    if (success) {
      await refetch();
      toast.success("Role updated successfully");
    } else {
      toast.error(error?.message || "Failed to update role");
    }
  };

  const handleTransferOwnership = async (memberId: string) => {
    const success = await transferOwnership(memberId);
    if (success) {
      toast.success("Ownership transferred successfully");
      // Update local auth user state to reflect new role (tokens were refreshed in cookies)
      useAuthStore.getState().checkAuth();
      await refetch();
    } else {
      toast.error(error?.message || "Failed to transfer ownership");
    }
  };

  const handleViewProfile = (id: string) => {
    navigate(PLAYER_ROUTES.PLAYER_DETAILS.replace(":id", id));
  };

  return (
    <div className="space-y-6">
      <OrganizerMemberHeader
        memberCount={currentOrg?.members?.length || 0}
        onAddMember={() => setIsInviteOpen(true)}
        canInvite={canInvite}
      />

      <div className="space-y-6">
        <OrganizerMemberList
          members={currentOrg?.members || []}
          onRemove={handleStaffRemove}
          onUpdateRole={handleUpdateRole}
          onViewProfile={handleViewProfile}
          onTransferOwnership={handleTransferOwnership}
          canManage={canUpdateRole}
          canRemove={canRemove}
          canTransfer={canTransfer}
          currentUserId={user?._id ?? ""}
          isLoading={isLoading}
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

      <OrganizerUserSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onAddSelected={handleAddSelectedMembers}
        isLoading={isLoading}
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
