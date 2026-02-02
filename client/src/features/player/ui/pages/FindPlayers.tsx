import { useEffect, useState } from "react";

import { AnimatePresence } from "framer-motion";

import PlayerCard from "../components/PlayerCard";
import PlayerFilters from "../components/PlayerFilters";
import { usePlayerStore } from "../../store/usePlayerStore";
import { ResourceGridWrapper } from "@/components/shared/ResourceGridWrapper";

const FindPlayers: React.FC = () => {
    const { players, isLoading, fetchPlayers, hasMore, currentPage, clearPlayers, totalCount } = usePlayerStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
    const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
    const [isPlayerVerified, setIsPlayerVerified] = useState<boolean | undefined>(undefined);
    const [hasTeam, setHasTeam] = useState<boolean | undefined>(undefined);

    // Debounced search/filter trigger
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPlayers({
                username: searchTerm || undefined,
                esportsRole: selectedRole,
                isAccountVerified: isVerified,
                isPlayerVerified: isPlayerVerified,
                hasTeam: hasTeam,
                page: 1,
                limit: 20,
                append: false
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedRole, isVerified, isPlayerVerified, hasTeam, fetchPlayers]);

    const handleLoadMore = () => {
        if (hasMore && !isLoading) {
            fetchPlayers({
                username: searchTerm || undefined,
                esportsRole: selectedRole,
                isAccountVerified: isVerified,
                isPlayerVerified: isPlayerVerified,
                hasTeam: hasTeam,
                page: currentPage + 1,
                limit: 20,
                append: true
            });
        }
    };

    useEffect(() => {
        return () => clearPlayers();
    }, [clearPlayers]);

    return (
        <ResourceGridWrapper
            title={
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-6xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                        Find <span className="text-purple-500">Elite</span> Players
                    </h1>
                </div>
            }
            description="Discover the next generation of esports talent. Filter through thousands of verified warriors ready for battle."
            stats={{ label: "Total Warriors", value: totalCount }}
            isLoading={isLoading}
            isEmpty={!isLoading && (!players || players.length === 0)}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            emptyMessage="No Warriors Detected"
            filters={
                <PlayerFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    isPlayerVerified={isPlayerVerified}
                    onPlayerVerifiedChange={setIsPlayerVerified}
                    hasTeam={hasTeam}
                    onHasTeamChange={setHasTeam}
                />
            }
        >
            <AnimatePresence mode="popLayout">
                {players && players.map((player, index) => (
                    <PlayerCard key={player._id} player={player} index={index} />
                ))}
            </AnimatePresence>
        </ResourceGridWrapper>
    );
};

export default FindPlayers;
