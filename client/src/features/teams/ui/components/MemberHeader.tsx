import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Info, LogOut, UserPlus, Users } from "lucide-react";

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
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { TeamMembersTypes } from "../../lib/types";

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
  const { isLoading, leaveMember, clearError, currentTeam } =
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


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{title}</h1>
          <Badge
            variant="outline"
            className="bg-[#0F111A]/40 border-white/10 text-gray-300 font-bold px-3 py-1 backdrop-blur-md"
          >
            <Users className="w-3.5 h-3.5 mr-2 text-purple-400" />
            {members.length} Members
          </Badge>
        </div>

        {showActions && (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onInfoToggle}
              className={`h-10 w-10 rounded-lg transition-all border border-white/10 ${showInfo
                ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                : "bg-[#0F111A]/60 text-gray-400 hover:text-white hover:bg-[#121421]/80 hover:border-purple-500/50"
                }`}
              title="Toggle Tournament Policy"
            >
              <Info className="w-5 h-5" />
            </Button>

            {(isOwner || members.find(m => m.user === currentUserId)?.systemRole === "team:manager") && (
              <Button
                onClick={() => setIsMemberDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all font-bold h-10 px-6"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Player
              </Button>
            )}

            {!isOwner && (
              <Button
                variant="outline"
                onClick={() => setIsLeaveDialogOpen(true)}
                className="border-white/10 bg-[#0F111A]/60 hover:bg-red-500/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all font-bold h-10 backdrop-blur-md shadow-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Team
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
