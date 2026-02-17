import React, { useEffect, useState, useCallback } from "react";
import { useTeamListStore } from "../../store/useTeamListStore";
import { AnimatePresence } from "framer-motion";
import TeamCard from "../components/TeamCard";
import TeamFilters from "../components/TeamFilters";
import { ResourceGridWrapper } from "@/components/shared/ResourceGridWrapper";

const FindTeams: React.FC = () => {
    const { paginatedTeamIds, teamsById, pagination, isLoading, fetchTeams } = useTeamListStore();
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState<string | undefined>();
    const [isRecruiting, setIsRecruiting] = useState<boolean | undefined>();
    const [isVerified, setIsVerified] = useState<boolean | undefined>();

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
        // More robust hasMore check: if total pages known, check correctness
        const safeHasMore = pagination.hasMore || (pagination.totalCount > pagination.currentPage * pagination.limit);

        if (safeHasMore && !isLoading) {
            loadTeams(pagination.currentPage + 1, true);
        }
    };

    return (
        <ResourceGridWrapper
            title={
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                        Find Your <span className="text-purple-500">Squad</span>
                    </h1>
                </div>
            }
            description="Browse through competitive teams or filter to find the perfect fit for your playstyle."
            stats={{ label: "Active Teams", value: pagination.totalCount }}
            isLoading={isLoading}
            isEmpty={!isLoading && paginatedTeams.length === 0}
            hasMore={pagination.hasMore}
            onLoadMore={handleLoadMore}
            emptyMessage="No teams found"
            filters={
                <TeamFilters
                    search={search}
                    onSearchChange={setSearch}
                    selectedRegion={region}
                    onRegionChange={setRegion}
                    isRecruiting={isRecruiting}
                    onRecruitingChange={setIsRecruiting}
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                />
            }
        >

            <AnimatePresence mode="popLayout">
                {paginatedTeams.map((team, index) => (
                    <TeamCard key={team._id} team={team} index={index} />
                ))}
            </AnimatePresence>
        </ResourceGridWrapper>
    );
};

export default FindTeams;
