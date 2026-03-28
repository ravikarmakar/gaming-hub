import React, { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { HeaderActions } from "@/components/HeaderActions";
import { useInfiniteTeamsQuery } from "../../hooks/useTeamQueries";
import TeamCard from "../components/dashboard/TeamCard";
import TeamFilters from "../components/dashboard/TeamFilters";
import { ResourceGridWrapper } from "@/components/shared/list/ResourceGridWrapper";
import { EmptyState } from "@/components/shared/feedback/EmptyState";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useDebounce } from "@/hooks/useDebounce";

const FindTeamsPage: React.FC = () => {
    const { width } = useWindowSize();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [region, setRegion] = useState<string | undefined>();
    const [isRecruiting, setIsRecruiting] = useState<boolean | undefined>();
    const [isVerified, setIsVerified] = useState<boolean | undefined>();
    const [showFilters, setShowFilters] = useState(false);

    const {
        data,
        isLoading,
        isError,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage
    } = useInfiniteTeamsQuery({
        limit: 20,
        search: debouncedSearch,
        region,
        isRecruiting,
        isVerified,
    });

    const paginatedTeams = useMemo(() => {
        return data?.pages.flatMap(page => page.data) || [];
    }, [data]);

    const totalCount = data?.pages[0]?.pagination?.totalCount || 0;

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleClearFilters = () => {
        setRegion(undefined);
        setIsRecruiting(undefined);
        setIsVerified(undefined);
    };

    return (
        <ResourceGridWrapper
            title={
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                            Find Your{" "}
                            <span className="text-purple-500 relative inline-flex items-center">
                                Squad
                                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 text-[8px] md:text-[9px] uppercase tracking-widest gap-1 whitespace-nowrap shadow-lg shrink-0">
                                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                                    {totalCount} Active Teams
                                </Badge>
                            </span>
                        </h1>
                    </div>
                </div>
            }
            description="Browse through competitive teams or filter to find the perfect fit for your playstyle."
            isLoading={isLoading}
            isError={isError}
            isFetchingMore={isFetchingNextPage}
            isEmpty={!isLoading && !isError && paginatedTeams.length === 0}
            hasMore={hasNextPage}
            onLoadMore={handleLoadMore}
            emptyStateComponent={<EmptyState message="No teams found" />}
            errorStateComponent={
                <EmptyState 
                    message="Failed to load teams" 
                    subMessage={error instanceof Error ? error.message : "A connection error occurred. Please try again."}
                />
            }
            loadingItemCount={20}
            showFilters={showFilters}
            headerAction={
                <HeaderActions
                    search={search}
                    setSearch={setSearch}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    onClearFilters={handleClearFilters}
                    placeholder="Search teams..."
                />
            }
            filters={
                <TeamFilters
                    selectedRegion={region}
                    onRegionChange={setRegion}
                    isRecruiting={isRecruiting}
                    onRecruitingChange={setIsRecruiting}
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                />
            }
            items={paginatedTeams}
            itemHeight={
                width && width < 640 ? 100 : // Mobile
                    width && width < 1024 ? 360 : // Tablet
                        380 // Desktop
            }
            virtualize={true}
            renderItem={(team, index) => <TeamCard key={team._id} team={team} index={index} />}
        />
    );
};

export default FindTeamsPage;


