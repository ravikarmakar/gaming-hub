import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { TeamChat } from "../components/TeamChat";

const TeamChatPage = () => {
    const { currentTeam } = useTeamStore();

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
