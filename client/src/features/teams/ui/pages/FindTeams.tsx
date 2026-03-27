import { useEffect, useState, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { HeaderActions } from "@/components/HeaderActions";
import { useTeamListStore } from "../../store/useTeamListStore";
import TeamCard from "../components/TeamCard";
import TeamFilters from "../components/TeamFilters";
import { ResourceGridWrapper } from "@/components/shared/list/ResourceGridWrapper";
import { EmptyState } from "@/components/shared/feedback/EmptyState";
import { useWindowSize } from "@/hooks/useWindowSize";

const FindTeams: React.FC = () => {
    const { width } = useWindowSize();
    const { paginatedTeamIds, teamsById, pagination, isLoading, fetchTeams } = useTeamListStore();
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState<string | undefined>();
    const [isRecruiting, setIsRecruiting] = useState<boolean | undefined>();
    const [isVerified, setIsVerified] = useState<boolean | undefined>();
    const [showFilters, setShowFilters] = useState(false);

    const paginatedTeams = paginatedTeamIds.map(id => teamsById[id]).filter(Boolean);

    const loadTeams = useCallback((page: number = 1, append: boolean = false) => {
        fetchTeams({
            page,
            limit: 20,
            search,
            region,
            isRecruiting,
            isVerified,
            append,
        });
    }, [fetchTeams, search, region, isRecruiting, isVerified]);

    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

    useEffect(() => {
        // Debounce search
        const delay = hasAttemptedFetch ? 500 : 0;
        const timer = setTimeout(() => {
            loadTeams(1, false);
            setHasAttemptedFetch(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [search, region, isRecruiting, isVerified, loadTeams]);

    const handleLoadMore = () => {
        const safeHasMore = pagination.hasMore || (pagination.totalCount > pagination.currentPage * pagination.limit);
        if (safeHasMore && !isLoading) {
            loadTeams(pagination.currentPage + 1, true);
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
                        <h1 className="text-4xl md:text-5xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                            Find Your{" "}
                            <span className="text-purple-500 relative inline-block">
                                Squad
                                <Badge variant="secondary" className="absolute -top-3 -right-24 md:-top-4 md:-right-28 px-1.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 text-[8px] md:text-[9px] uppercase tracking-widest gap-1 whitespace-nowrap shadow-lg">
                                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                                    {pagination.totalCount} Active Teams
                                </Badge>
                            </span>
                        </h1>
                    </div>
                </div>
            }
            description="Browse through competitive teams or filter to find the perfect fit for your playstyle."
            isLoading={isLoading}
            isEmpty={!isLoading && paginatedTeams.length === 0}
            hasMore={pagination.hasMore}
            onLoadMore={handleLoadMore}
            emptyStateComponent={<EmptyState message="No teams found" />}
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
            itemHeight={(width ?? 1200) < 640 ? 80 : 380}
            virtualize={true}
            renderItem={(team, index) => <TeamCard key={team._id} team={team} index={index} />}
        />
    );
};

export default FindTeams;


