import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { TeamChat } from "../components/TeamChat";

const TeamChatPage = () => {
    const { currentTeam } = useTeamManagementStore();

    if (!currentTeam) return null;

    return (
        <div className="h-full flex flex-col">
            <TeamChat
                teamId={currentTeam._id}
                teamName={currentTeam.teamName}
            />
        </div>
    );
};

export default TeamChatPage;
