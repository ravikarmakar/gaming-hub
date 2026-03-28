import { FeatureSkeleton } from "@/components/shared/feedback/FeatureSkeleton";

interface TeamLoadingProps {
    message?: string;
    variant?: "default" | "fullscreen";
}

export const TeamLoading = ({ 
    message = "Loading team intelligence...",
    variant = "default"
}: TeamLoadingProps) => {
    return <FeatureSkeleton message={message} variant={variant} />;
};
