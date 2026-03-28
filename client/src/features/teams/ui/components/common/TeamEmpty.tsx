import { User } from "lucide-react";
import { EmptyState } from "@/components/shared/feedback/EmptyState";

interface TeamEmptyProps {
    message?: string;
    subMessage?: string;
    action?: React.ReactNode;
}

export const TeamEmpty = ({ 
    message = "No teams found", 
    subMessage = "Try adjusting your filters or search terms.",
    action 
}: TeamEmptyProps) => {
    return (
        <EmptyState
            icon={User}
            message={message}
            subMessage={subMessage}
            action={action}
        />
    );
};
