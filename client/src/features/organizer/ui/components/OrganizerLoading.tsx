import { FeatureSkeleton } from "@/components/shared/feedback/FeatureSkeleton";

interface OrganizerLoadingProps {
    message?: string;
}

export const OrganizerLoading = ({ message = "Loading organization data..." }: OrganizerLoadingProps) => {
    return <FeatureSkeleton message={message} />;
};
