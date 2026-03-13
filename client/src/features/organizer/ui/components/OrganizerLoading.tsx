import { FeatureSkeleton } from "@/components/shared/FeatureSkeleton";

interface OrganizerLoadingProps {
    message?: string;
}

export const OrganizerLoading = ({ message = "Loading organization data..." }: OrganizerLoadingProps) => {
    return <FeatureSkeleton message={message} />;
};
