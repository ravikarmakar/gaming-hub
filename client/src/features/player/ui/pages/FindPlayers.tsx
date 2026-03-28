import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

import PlayerCard from "../components/PlayerCard";
import PlayerFilters from "../components/PlayerFilters";
import { useInfinitePlayersQuery } from "../../hooks/usePlayerQueries";
import { ResourceGridWrapper } from "@/components/shared/list/ResourceGridWrapper";
import { HeaderActions } from "@/components/HeaderActions";
import { EmptyState } from "@/components/shared/feedback/EmptyState";
import { useWindowSize } from "@/hooks/useWindowSize";

const FindPlayers: React.FC = () => {
    const { width } = useWindowSize();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);

    const [isPlayerVerified, setIsPlayerVerified] = useState<boolean | undefined>(undefined);
    const [hasTeam, setHasTeam] = useState<boolean | undefined>(undefined);
    const [showFilters, setShowFilters] = useState(false);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfinitePlayersQuery({
        username: debouncedSearchTerm || undefined,
        esportsRole: selectedRole,

        isPlayerVerified: isPlayerVerified,
        hasTeam: hasTeam,
        limit: 20
    });

    const players = data?.pages.flatMap(page => page.players) || [];

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleClearFilters = () => {
        setSelectedRole(undefined);
        setIsPlayerVerified(undefined);
        setHasTeam(undefined);
    };

    return (
        <ResourceGridWrapper
            title={
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                        Find Elite <span className="text-purple-500">Players</span>
                    </h1>
                </div>
            }
            description="Discover the next generation of esports talent. Filter through thousands of verified warriors ready for battle."
            isLoading={isLoading}
            isFetchingMore={isFetchingNextPage}
            isEmpty={!isLoading && players.length === 0}
            hasMore={hasNextPage}
            onLoadMore={handleLoadMore}
            emptyStateComponent={<EmptyState message="No Warriors Detected" />}
            loadingItemCount={20}
            items={players}
            renderItem={(player: any, index: number) => (
                <PlayerCard key={player._id} player={player} index={index} />
            )}
            virtualize={true}
            showFilters={showFilters}
            headerAction={
                <HeaderActions
                    search={searchTerm}
                    setSearch={setSearchTerm}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    onClearFilters={handleClearFilters}
                    placeholder="Search players..."
                />
            }
            itemHeight={(width ?? 1200) < 640 ? 80 : 380}
            filters={
                <PlayerFilters
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                    isPlayerVerified={isPlayerVerified}
                    onPlayerVerifiedChange={setIsPlayerVerified}
                    hasTeam={hasTeam}
                    onHasTeamChange={setHasTeam}
                />
            }
        />
    );
};

export default FindPlayers;
