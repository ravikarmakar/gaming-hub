import { useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Loader2, AlertCircle, Info, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { TeamMembers } from "../components/TeamMembers";
import { MemberHeader } from "../components/MemberHeader";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { JoinRequestsList } from "../components/JoinRequestsList";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { TEAM_ACTIONS, TEAM_ACTIONS_ACCESS } from "../../lib/access";

const TeamMembersPage = () => {
  const {
    currentTeam,
    getTeamById,
    isLoading,
    error,
    removeMember,
    updateMemberRole,
  } = useTeamStore();
  const { user } = useAuthStore();
  const { can } = useAccess()

  // RBAC
  const accessJoinRequestList = can(
    TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.accessJoinRequestList]
  );
  const canManageRoster = can(
    TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.manageRoster]
  );

  useEffect(() => {
    if (user?.teamId) {
      getTeamById(user.teamId);
    }
  }, [user?.teamId, getTeamById]);

  const handleRemove = useCallback(
    async (memberId: string) => {
      const result = await removeMember(memberId);
      if (result && result.success) {
        if (user?.teamId) {
          await getTeamById(user.teamId);
        }
        toast.success(result.message || "Member removed successfully");
      } else {
        toast.error(result?.message || "Failed to remove member");
      }
    },
    [removeMember, user?.teamId, getTeamById]
  );

  const handleEditRole = useCallback(
    async (role: string, memberId: string) => {
      const result = await updateMemberRole(role, memberId);
      if (result) {
        if (user?.teamId) {
          await getTeamById(user.teamId);
        }
        toast.success("Member role updated successfully");
      } else {
        toast.error("Failed to update member role");
      }
    },
    [updateMemberRole, user?.teamId, getTeamById]
  );

  if (isLoading && !currentTeam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0C1A]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-purple-400 animate-spin" />
          <p className="text-sm text-gray-400">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0C1A] text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Failed to Load Members
        </h2>
        <p className="text-gray-400 max-w-md mb-6">{error}</p>
        <Button
          variant="outline"
          onClick={() => user?.teamId && getTeamById(user.teamId)}
          className="border-white/10 hover:bg-white/5 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!currentTeam) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0C1A]">
      <MemberHeader
        currentUserId={user?._id ?? ""}
        teamId={currentTeam._id}
        members={currentTeam.teamMembers ?? []}
      />

      <ScrollArea className="h-[calc(100vh-140px)]">
        <main className="px-4 md:px-8 py-8 mx-auto max-w-7xl space-y-12">


          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-blue-300">Tournament Registration Note</h4>
              <p className="text-sm text-blue-200/80 leading-relaxed">
                Only members with <span className="text-blue-100 font-medium">IGL, Rusher, Sniper, and Support</span> roles will be automatically registered for tournaments.
                Any other roles will be listed as substitutes.
              </p>
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Active Roster</h2>
            </div>
            <TeamMembers
              members={currentTeam.teamMembers ?? []}
              owner={canManageRoster}
              currentUserId={user?._id ?? ""}
              onRemove={handleRemove}
              onEditRole={handleEditRole}
              isLoading={isLoading}
            />
          </section>

          {accessJoinRequestList && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <JoinRequestsList />
            </section>
          )}
        </main>
      </ScrollArea>
    </div>
  );
};

export default TeamMembersPage;
