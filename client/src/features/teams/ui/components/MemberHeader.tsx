import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Info, LogOut, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { TeamPageHeader } from "./TeamPageHeader";
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


      <TeamPageHeader
        icon={Users}
        title={title}
        subtitle={`Manage your team members and roster (${members.length} Active)`}
        actions={
          showActions && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle Info"
                onClick={onInfoToggle}
                className={`h-9 w-9 rounded-lg transition-all border border-white/10 shrink-0 ${showInfo
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "bg-[#0F111A]/60 text-gray-400 hover:text-white hover:bg-[#121421]/80 hover:border-purple-500/50"
                  }`}
                title="Toggle Tournament Policy"
              >
                <Info className="w-4 h-4" />
              </Button>

              {(isOwner || members.find(m => m.user === currentUserId)?.systemRole === "team:manager") && (
                <Button
                  onClick={() => setIsMemberDialogOpen(true)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-900/20 transition-all font-bold h-9 px-4 shrink-0"
                >
                  <UserPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Invite Player</span>
                </Button>
              )}

              {!isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLeaveDialogOpen(true)}
                  className="border-white/10 bg-[#0F111A]/60 hover:bg-red-500/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all font-bold h-9 backdrop-blur-md shadow-lg shrink-0"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Leave Team</span>
                </Button>
              )}
            </>
          )
        }
      />
    </>
  );
};
