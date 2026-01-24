import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PlayerSearchCommand } from "@/features/player/ui/components/PlayerSearchCommand";
import {
  TeamMembersTypes,
  useTeamStore,
} from "@/features/teams/store/useTeamStore";

interface MemberHeaderProps {
  teamId: string;
  members: TeamMembersTypes[];
  currentUserId: string;
}

export const MemberHeader = ({
  members,
  currentUserId,
}: Omit<MemberHeaderProps, "teamId">) => {
  const navigate = useNavigate();
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const { isLoading, leaveMember, clearError } = useTeamStore();

  const handleSingleInvite = async (id: string) => {
    const { success, message } = await useTeamStore.getState().inviteMember(id);
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
    if (result) {
      toast.success("Team left successfully");
      navigate("/");
    }
    setIsLeaveDialogOpen(false);
  };

  const isOwner = members.find(
    (member) => member.user === currentUserId && member.roleInTeam === "igl"
  );

  return (
    <>
      <PlayerSearchCommand
        open={isMemberDialogOpen}
        onOpenChange={(val) => !val && closeSearchDialog()}
        onInvite={handleSingleInvite}
        isLoading={isLoading}
        existingMemberIds={members.map((m) => m.user)}
      />

      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent className="bg-[#1A1B2E] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Leave Team?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to leave this team? This action cannot be undone.
              You'll need to be invited again to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20"
            >
              Leave Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-6 bg-[#0B0C1A] border-b border-white/10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <Badge
            variant="outline"
            className="bg-white/5 border-white/10 text-gray-400"
          >
            <Users className="w-3 h-3 mr-1" />
            {members.length}
          </Badge>
        </div>

        {isOwner ? (
          <Button
            onClick={() => setIsMemberDialogOpen(true)}
            className="bg-white/5 border border-white/10 hover:bg-white/[0.07] text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        ) : (
          <Button
            onClick={() => setIsLeaveDialogOpen(true)}
            variant="outline"
            className="border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-gray-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Team
          </Button>
        )}
      </div>
    </>
  );
};
