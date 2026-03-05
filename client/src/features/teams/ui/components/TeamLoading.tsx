import { FeatureSkeleton } from "@/components/shared/FeatureSkeleton";

interface TeamLoadingProps {
    message?: string;
}

export const TeamLoading = ({ message = "Loading team intelligence..." }: TeamLoadingProps) => {
    return <FeatureSkeleton message={message} />;
};
