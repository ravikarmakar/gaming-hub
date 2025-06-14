/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import toast from "react-hot-toast";

import { TeamMembers } from "../components/TeamMembers";
import { MemberHeader } from "../components/MemberHeader";

import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const TeamMembersPage = () => {
  const {
    currentTeam,
    getTeamById,
    isLoading,
    removeMember,
    updateMemberRole,
  } = useTeamStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if ((!currentTeam || user) && user) {
      getTeamById(user.teamId);
    }
  }, []);

  const onRemove = async (memberId: string) => {
    const result = await removeMember(memberId);
    if (result) {
      if (user?.teamId) {
        await getTeamById(user.teamId);
      }
      toast.success("Member removed successfully");
    }
  };

  const onEditRole = async (role: string, id: string) => {
    const result = await updateMemberRole(role, id);
    if (result) {
      if (user?.teamId) {
        await getTeamById(user.teamId);
      }
      toast.success("Member role updated");
    }
  };

  const isOwner = currentTeam?.captain?.toString() === user?._id?.toString();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MemberHeader
        currentUserId={user?._id ?? ""}
        teamId={currentTeam?._id ?? ""}
        members={currentTeam?.teamMembers ?? []}
      />
      <main className="z-10 w-full h-screen px-4 py-4 mx-auto bg-gray-900 md:px-8">
        <TeamMembers
          members={currentTeam?.teamMembers ?? []}
          owner={isOwner}
          onRemove={onRemove}
          onEditRole={onEditRole}
          isLoading={isLoading}
        />
      </main>
    </>
  );
};

export default TeamMembersPage;
