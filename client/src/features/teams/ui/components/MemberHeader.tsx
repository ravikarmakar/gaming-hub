import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, UserPlus, Users, Trash2 } from "lucide-react";

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
}: MemberHeaderProps) => {
  const navigate = useNavigate();
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isLoading, leaveMember, deleteTeam, clearError, currentTeam } =
    useTeamStore();

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
    if (result && result.success) {
      toast.success("Team left successfully!");
      // Navigation is handled at top level by TeamLayout or here
      setTimeout(() => navigate("/"), 0);
    } else {
      toast.error("Failed to leave team. Please try again.");
    }
    setIsLeaveDialogOpen(false);
  };

  const handleDeleteTeam = async () => {
    const result = await deleteTeam();
    if (result && result.success) {
      toast.success("Team disbanded successfully!");
      setTimeout(() => navigate("/"), 0);
    } else {
      toast.error(
        result?.message || "Failed to disband team. Please try again."
      );
    }
    setIsDeleteDialogOpen(false);
  };

  const isOwner =
    currentTeam?.captain?.toString() === currentUserId?.toString();

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
        <AlertDialogContent className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white tracking-tight">Leave Team?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-medium">
              Are you sure you want to leave this team? This action cannot be undone.
              You'll need to be invited again to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              className="bg-red-600 hover:bg-red-500 text-white border-0 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all font-bold"
            >
              Leave Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white tracking-tight">Disband Team?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-medium leading-relaxed">
              Are you sure you want to disband this team? This action is <span className="text-red-500 font-black uppercase">permanent</span> and cannot be undone.
              All members will be removed and the team profile will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className="bg-red-600 hover:bg-red-500 text-white border-0 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all font-bold"
            >
              Disband Team
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
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsMemberDialogOpen(true)}
              className="bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Members
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Disband Team
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsLeaveDialogOpen(true)}
            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Team
          </Button>
        )}
      </div>
    </>
  );
};
