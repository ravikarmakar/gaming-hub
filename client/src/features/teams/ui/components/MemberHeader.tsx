import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  teamId,
  members,
  currentUserId,
}: MemberHeaderProps) => {
  const navigate = useNavigate();
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const { isLoading, addMembers, error, getTeamById, leaveMember } =
    useTeamStore();

  const handleAddMembers = async (ids: string[]) => {
    const result = await addMembers(ids);
    if (result) {
      await getTeamById(teamId);
      toast.success("Members added successfully");
    } else {
      toast.error(error);
    }
    setIsMemberDialogOpen(false);
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave the team?")) {
      return;
    }

    const result = await leaveMember();
    if (result) {
      toast.success("Team left successfully");
      navigate("/");

      // TODO: invalidate the backend cache
    }
  };

  const isOwner = members.find(
    (members) => members.user === currentUserId && members.roleInTeam === "igl"
  );

  return (
    <>
      <PlayerSearchCommand
        open={isMemberDialogOpen}
        onOpenChange={setIsMemberDialogOpen}
        onSubmit={(ids) => handleAddMembers(ids)}
        isLoading={isLoading}
      />
      <div className="flex flex-col px-4 py-4 bg-gray-900 md:px-8 gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">Team Members</h5>
          {isOwner ? (
            <Button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-300 ease-in-out border shadow-sm rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/50 hover:to-pink-500/50 backdrop-blur-md border-white/10"
              onClick={() => setIsMemberDialogOpen(true)}
            >
              <PlusIcon />
              New Members
            </Button>
          ) : (
            <Button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-300 ease-in-out border shadow-sm rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/50 hover:to-pink-500/50 backdrop-blur-md border-white/10"
              onClick={handleLeave}
            >
              <LogOut />
              Leave Team
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
