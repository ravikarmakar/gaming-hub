import { TeamMembersList } from "@/features/teams/ui/components/roster/TeamMembersList";
import { MemberHeader } from "@/features/teams/ui/components/roster/MemberHeader";
import { JoinRequestsList } from "@/features/teams/ui/components/roster/JoinRequestsList";
import { useTeamDashboard } from "@/features/teams/context/TeamDashboardContext";

const TeamMembersPage = () => {
  const {
    team: currentTeam,
    permissions,
  } = useTeamDashboard();

  if (!currentTeam) {
    return null;
  }

  const { accessJoinRequestList } = permissions;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MemberHeader noMargin={true} />

      <main className="flex-1 overflow-y-auto w-full px-4 md:px-6 pt-2 md:pt-4 pb-4 md:pb-8 space-y-8">
        <TeamMembersList />

        {accessJoinRequestList && (
          <div className="pt-4">
            <JoinRequestsList />
          </div>
        )}
      </main>
    </div >
  );
};

export default TeamMembersPage;
