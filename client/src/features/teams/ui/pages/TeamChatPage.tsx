import { MessageSquare, Users } from "lucide-react";
import { TeamChat } from "../components/chat/TeamChat";
import { useTeamDashboard } from "../../context/TeamDashboardContext";
import { TeamPageHeader } from "../components/common/TeamPageHeader";

const TeamChatPage = () => {
  const { team: currentTeam } = useTeamDashboard();

  if (!currentTeam) return null;

  const memberCount = currentTeam.teamMembers?.length || 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TeamPageHeader
        icon={MessageSquare}
        title="Team Chat"
        subtitle="Coordinate tactical strategies and communicate in real-time with your squad."
        badgeText={`${memberCount} ${memberCount === 1 ? 'Member' : 'Members'}`}
        badgeIcon={Users}
        badgeColor="bg-blue-500/10 border-blue-500/20 text-blue-400"
        noMargin={true}
        compact={true}
      />
      <main className="flex-1 min-h-0 bg-[#08090F]/40">
        <TeamChat
          teamId={currentTeam._id}
          teamName={currentTeam.teamName}
          variant="page"
          hideHeader={true}
        />
      </main>
    </div>
  );
};

export default TeamChatPage;
