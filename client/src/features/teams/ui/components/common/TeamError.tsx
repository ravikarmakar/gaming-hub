import { FeatureError } from "@/components/shared/feedback/FeatureError";

interface TeamErrorProps {
    message?: string;
    onRetry?: () => void;
    title?: string;
}

export const TeamError = ({
    message = "Failed to load team data",
    onRetry,
    title = "Connection Error"
}: TeamErrorProps) => {
    return (
        <FeatureError
            message={message}
            onRetry={onRetry}
            title={title}
        />
    );
};
