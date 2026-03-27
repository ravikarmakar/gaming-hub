import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

import { useInfiniteOrganizersQuery } from "../../hooks/useOrganizerQueries";
import OrganizerCard from "../components/OrganizerCard";
import { ResourceGridWrapper } from "@/components/shared/list/ResourceGridWrapper";
import { HeaderActions } from "@/components/HeaderActions";
import { EmptyState } from "@/components/shared/feedback/EmptyState";
import { useWindowSize } from "@/hooks/useWindowSize";

export const FindOrganizers = () => {
    const { width } = useWindowSize();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [showFilters, setShowFilters] = useState(false);

    const {
        data: organizersData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteOrganizersQuery(20, debouncedSearchQuery);

    const organizers = organizersData?.pages.flatMap((page: any) => page.data) || [];

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <ResourceGridWrapper
            title={
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                        Find <span className="text-purple-500">Organizers</span>
                    </h1>
                </div>
            }
            description="Discover and follow the most influential organizations driving the future of competitive gaming. Join their community and compete in elite tournaments."
            isLoading={isLoading}
            isFetchingMore={isFetchingNextPage}
            isEmpty={!isLoading && organizers.length === 0}
            hasMore={!!hasNextPage}
            onLoadMore={handleLoadMore}
            emptyStateComponent={<EmptyState message="No Organizers Found" />}
            loadingItemCount={20}
            items={organizers}
            renderItem={(organizer, index) => <OrganizerCard key={organizer._id} organizer={organizer} index={index} />}
            virtualize={true}
            showFilters={showFilters}
            headerAction={
                <HeaderActions
                    search={searchQuery}
                    setSearch={setSearchQuery}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    onClearFilters={() => setSearchQuery("")}
                    placeholder="Search organizers..."
                />
            }
            itemHeight={(width ?? 1200) < 640 ? 80 : 380}
            filters={
                <div className="text-white/50 text-sm py-4 bg-white/[0.02] rounded-xl border border-white/[0.05] p-6 text-center w-full">
                    Additional organization filters coming soon.
                </div>
            }
        />
    );
};

export default FindOrganizers;
