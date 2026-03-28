import { ChatWindow } from "@/features/chat";

interface TeamChatProps {
    teamId: string;
    teamName: string;
    canDeleteParent?: boolean;
    variant?: "window" | "page";
    hideHeader?: boolean;
}

export const TeamChat = ({ teamId, teamName, canDeleteParent, variant, hideHeader }: TeamChatProps) => {
    return (
        <ChatWindow
            targetId={teamId}
            targetName={teamName}
            scope="team"
            canDeleteParent={canDeleteParent}
            variant={variant}
            hideHeader={hideHeader}
        />
    );
};
