import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

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

import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { ErrorFallback } from "@/components/ErrorFallback";
import { OrganizerError } from "../components/OrganizerError";

export const OrganizerMemberPageContent = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Confirmation Dialog State
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: "remove" | "transfer" | "leave" | null;
    memberId: string | null;
    username?: string;
  }>({
    open: false,
    type: null,
    memberId: null,
  });

  const { user } = useAuthStore();
  const { can } = useAccess();

  const {
    data: orgData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOrgByIdQuery(user?.orgId as string, page, 20, searchQuery, {
    enabled: !!user?.orgId,
  });

  const currentOrg = orgData?.data;
  const memberPagination = orgData?.pagination;

  const {
    handleAddSelectedMembers,
    handleStaffRemove,
    handleLeaveOrg,
    handleUpdateRole,
    handleTransferOwnership,
    isAddingStaff,
    pendingMemberId,
  } = useManageOrgMembers(currentOrg?._id);

  const handleConfirmAction = () => {
    if (!confirmState.type) return;

    if (confirmState.type === "remove" && confirmState.memberId) {
      handleStaffRemove(confirmState.memberId);
    } else if (confirmState.type === "transfer" && confirmState.memberId) {
      handleTransferOwnership(confirmState.memberId);
    } else if (confirmState.type === "leave") {
      handleLeaveOrg();
    }

    setConfirmState({ open: false, type: null, memberId: null });
  };

  const getDialogContent = () => {
    switch (confirmState.type) {
      case "remove":
        return {
          title: "Remove Member",
          description: `Are you sure you want to remove ${confirmState.username} from the organization? They will lose all access immediately.`,
          actionLabel: "Remove Member",
          variant: "danger" as const
        };
      case "transfer":
        return {
          title: "Transfer Ownership",
          description: `Are you sure you want to transfer ownership to ${confirmState.username}? You will be demoted to a Manager and this action cannot be undone.`,
          actionLabel: "Transfer Ownership",
          variant: "warning" as const
        };
      case "leave":
        return {
          title: "Leave Organization",
          description: "Are you sure you want to leave this organization? You will need an invite to rejoin.",
          actionLabel: "Leave Organization",
          variant: "danger" as const
        };
      default:
        return {
          title: "",
          description: "",
          actionLabel: "Confirm",
          variant: "default" as const
        };
    }
  };

  const dialogContent = getDialogContent();

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

  // RBAC
  const canInvite = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.inviteMember]);
  const canRemove = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.removeMember]);
  const canUpdateRole = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.updateRole]);
  const canTransfer = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.transferOwnership]);
  const canLeave = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.leaveOrg]);

  const handleViewProfile = (id: string) => {
    navigate(PLAYER_ROUTES.PLAYER_DETAILS.replace(":id", id));
  };

  if (isError && !currentOrg) {
    return (
      <OrganizerError
        title="Failed to load members"
        message={error?.message || "Something went wrong while fetching the organization members."}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmActionDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState(prev => ({ ...prev, open }))}
        title={dialogContent.title}
        description={dialogContent.description}
        actionLabel={dialogContent.actionLabel}
        variant={dialogContent.variant}
        onConfirm={handleConfirmAction}
        isLoading={isLoading}
      />

      <OrganizerMemberHeader
        memberCount={currentOrg?.members?.length || 0}
        onAddMember={() => setIsInviteOpen(true)}
        canInvite={canInvite}
        onLeave={() => setConfirmState({ open: true, type: "leave", memberId: null })}
        canLeave={canLeave}
      />

      <div className="space-y-6">
        <OrganizerMemberList
          members={sortedMembers}
          onRemove={(id) => {
            const member = currentOrg?.members?.find((m: any) => m._id === id);
            setConfirmState({ open: true, type: "remove", memberId: id, username: member?.username });
          }}
          onUpdateRole={handleUpdateRole}
          onViewProfile={handleViewProfile}
          onTransferOwnership={(id) => {
            const member = currentOrg?.members?.find((m: any) => m._id === id);
            setConfirmState({ open: true, type: "transfer", memberId: id, username: member?.username });
          }}
          onLeave={() => setConfirmState({ open: true, type: "leave", memberId: null })}
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

      <OrganizerUserSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onAddSelected={handleAddSelectedMembers}
        isLoading={isLoading || isAddingStaff}
        existingMemberIds={currentOrg?.members?.map((m: any) => m._id) || []}
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

export const OrganizerMemberPage = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OrganizerMemberPageContent />
    </ErrorBoundary>
  );
};

export default OrganizerMemberPage;
