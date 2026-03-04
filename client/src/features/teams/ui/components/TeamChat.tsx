import { ChatWindow } from "./ChatWindow";

interface TeamChatProps {
    teamId: string;
    teamName: string;
    canDeleteParent?: boolean;
    variant?: "window" | "page";
}

export const TeamChat = ({ teamId, teamName, canDeleteParent, variant }: TeamChatProps) => {
    return (
        <ChatWindow
            targetId={teamId}
            targetName={teamName}
            scope="team"
            canDeleteParent={canDeleteParent}
            variant={variant}
        />
    );
};
