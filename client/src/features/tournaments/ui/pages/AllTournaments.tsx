import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

import { useGetInfiniteTournamentsQuery } from "@/features/tournaments/hooks/useTournamentQueries";
import TournamentCard from "@/features/tournaments/ui/components/shared/TournamentCard";
import { TournamentFilters } from "@/features/tournaments/ui/components/TournamentFilters";
import { ResourceGridWrapper } from "@/components/shared/ResourceGridWrapper";
import { HeaderActions } from "@/components/HeaderActions";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState } from "@/components/shared/EmptyState";
import { useWindowSize } from "@/hooks/useWindowSize";


const AllTournaments = () => {
    const { width } = useWindowSize();
    const [gameFilter, setGameFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [showFilters, setShowFilters] = useState(false);

    const {
        data: infiniteData,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useGetInfiniteTournamentsQuery({
        search: debouncedSearchTerm || undefined,
        game: gameFilter !== "all" ? gameFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        limit: 12
    });

    const events = useMemo(() => {
        return infiniteData?.pages.flatMap((page: any) => page.data || []) || [];
    }, [infiniteData]);

    const stats = useMemo(() => {
        return {
            totalPrize: events.reduce((acc: number, e: any) => acc + (Number(e.prizePool) || 0), 0),
            count: events.length
        };
    }, [events]);

    const uniqueGames = useMemo(() => {
        const games = new Set(events.map((e: any) => e.game));
        return Array.from(games);
    }, [events]);


    const handleClearFilters = () => {
        setSearchTerm("");
        setGameFilter("all");
        setCategoryFilter("all");
    };

    return (

        <ResourceGridWrapper
            title={
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                            Tournament{" "}
                            <span className="text-purple-500 relative inline-block">
                                World
                                <Badge variant="secondary" className="absolute -top-3 -right-24 md:-top-4 md:-right-28 px-1.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 text-[8px] md:text-[9px] uppercase tracking-widest gap-1 whitespace-nowrap shadow-lg">
                                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                                    {stats.count} Active Arenas
                                </Badge>
                            </span>
                        </h1>
                    </div>
                </div>
            }
            description="Browse through our curated list of competitive tournaments and scrims."
            isLoading={isLoading}
            isEmpty={!isLoading && events.length === 0}
            hasMore={!!hasNextPage}
            onLoadMore={fetchNextPage}
            emptyStateComponent={<EmptyState message="No Tournaments found" />}
            isFetchingMore={isFetchingNextPage}
            showFilters={showFilters}
            headerAction={
                <HeaderActions
                    search={searchTerm}
                    setSearch={setSearchTerm}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    onClearFilters={handleClearFilters}
                    placeholder="Search tournaments..."
                />
            }
            filters={
                <TournamentFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    gameFilter={gameFilter}
                    setGameFilter={setGameFilter}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    uniqueGames={uniqueGames}
                />
            }
            items={events}
            itemHeight={(width ?? 1200) < 640 ? 140 : 400}
            virtualize={true}
            rowGap={32}
            columnGap="2rem"
            renderItem={(event, index) => <TournamentCard
                key={event._id}
                event={event}
                index={index}
            />}
        />
    );
};

export default AllTournaments;
