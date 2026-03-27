import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { MemberListHeader } from "@/components/shared/list/MemberListHeader";
import { PlayerSearchCommand } from "@/features/player/ui/components/PlayerSearchCommand";
import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { useJoinRequestStore } from "@/features/teams/store/useJoinRequestStore";
import { TeamMembersTypes } from "@/features/teams/lib/types";

interface MemberHeaderProps {
  teamId: string;
  members: TeamMembersTypes[];
  currentUserId: string;
  onInfoToggle: () => void;
  showInfo: boolean;
  title?: string;
  showActions?: boolean;
}

export const MemberHeader = ({
  members,
  currentUserId,
  onInfoToggle,
  showInfo,
  title = "Active Roster",
  showActions = true,
}: MemberHeaderProps) => {
  const navigate = useNavigate();
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const { currentTeam, leaveMember, clearError, isLoading: teamLoading } = useTeamManagementStore();
  const { inviteMember, isLoading: inviteLoading } = useJoinRequestStore();

  const handleSingleInvite = async (id: string) => {
    if (!currentTeam?._id) return false;
    const { success, message } = await inviteMember(id, currentTeam._id);
    if (success) {
      toast.success("Invite sent successfully");
      return true;
    } else {
      toast.error(message || "Failed to send invite");
      return false;
    }
  };

  const closeSearchDialog = () => {
    setIsMemberDialogOpen(false);
    clearError();
  };

  const handleLeave = async () => {
    const result = await leaveMember();
    if (result && result.success) {
      toast.success("Team left successfully!");
      // Navigation is handled at top level by TeamLayout or here
      setTimeout(() => navigate("/"), 0);
    } else {
      toast.error("Failed to leave team. Please try again.");
    }
    setIsLeaveDialogOpen(false);
  };


  const isOwner =
    currentTeam?.captain?.toString() === currentUserId?.toString();

  return (
    <>
      <PlayerSearchCommand
        open={isMemberDialogOpen}
        onOpenChange={(val) => !val && closeSearchDialog()}
        onInvite={handleSingleInvite}
        isLoading={inviteLoading || teamLoading}
        existingMemberIds={members.map((m) => m.user)}
      />

      <ConfirmActionDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        title="Leave Team?"
        description="Are you sure you want to leave this team? This action cannot be undone. You'll need to be invited again to rejoin."
        actionLabel="Leave Team"
        onConfirm={handleLeave}
        isLoading={teamLoading}
        variant="danger"
      />


      <MemberListHeader
        title={title}
        subtitle="Manage your team members and roster"
        memberCount={members.length}
        onInfoToggle={showActions ? onInfoToggle : undefined}
        showInfo={showInfo}
        onAddMember={() => setIsMemberDialogOpen(true)}
        canInvite={showActions && !!(isOwner || members.find(m => m.user === currentUserId)?.systemRole === "team:manager")}
        onLeave={() => setIsLeaveDialogOpen(true)}
        canLeave={showActions && (!isOwner)}
        className="mb-8"
      />
    </>
  );
};
