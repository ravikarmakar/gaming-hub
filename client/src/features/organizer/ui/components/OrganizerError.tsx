import { FeatureError } from "@/components/shared/feedback/FeatureError";

interface OrganizerErrorProps {
    message?: string;
    onRetry?: () => void;
    title?: string;
}

export const OrganizerError = ({
    message = "Failed to load organization data",
    onRetry,
    title = "Connection Error"
}: OrganizerErrorProps) => {
    return (
        <FeatureError
            message={message}
            onRetry={onRetry}
            title={title}
        />
    );
};
