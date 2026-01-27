import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import PlayerCard from "../components/PlayerCard";
import PlayerFilters from "../components/PlayerFilters";
import { usePlayerStore } from "../../store/usePlayerStore";

const FindPlayers: React.FC = () => {
    const { players, isLoading, fetchPlayers, hasMore, currentPage, clearPlayers, totalCount } = usePlayerStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
    const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
    const [hasTeam, setHasTeam] = useState<boolean | undefined>(undefined);

    // Debounced search/filter trigger
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPlayers({
                username: searchTerm || undefined,
                esportsRole: selectedRole,
                isAccountVerified: isVerified,
                hasTeam: hasTeam,
                page: 1,
                limit: 12,
                append: false
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedRole, isVerified, hasTeam, fetchPlayers]);

    // Load more handler
    const handleLoadMore = () => {
        if (hasMore && !isLoading) {
            fetchPlayers({
                username: searchTerm || undefined,
                esportsRole: selectedRole,
                isAccountVerified: isVerified,
                hasTeam: hasTeam,
                page: currentPage + 1,
                limit: 12,
                append: true
            });
        }
    };

    useEffect(() => {
        return () => clearPlayers();
    }, [clearPlayers]);

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 md:px-12">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-800/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "12000ms" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-800/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "15000ms" }} />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-800/15 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: "20000ms" }} />
                <div className="absolute top-[50%] left-[10%] w-[35%] h-[35%] bg-indigo-800/10 blur-[110px] rounded-full animate-pulse" style={{ animationDuration: "25000ms" }} />
                <div className="absolute top-[10%] left-[40%] w-[30%] h-[30%] bg-purple-800/10 blur-[90px] rounded-full" />
                <div className="absolute top-[60%] right-[30%] w-[30%] h-[30%] bg-violet-800/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[20%] left-[30%] w-[25%] h-[25%] bg-fuchsia-800/10 blur-[80px] rounded-full animate-pulse" style={{ animationDuration: "18000ms" }} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm">
                                <Users className="w-8 h-8 text-violet-400" />
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none">
                                Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-[length:200%_auto] animate-gradient">Elite</span> Players
                            </h1>
                        </div>
                        <p className="text-white/40 font-medium max-w-2xl uppercase text-[10px] md:text-xs tracking-[0.2em] leading-relaxed italic border-l-2 border-violet-500/20 pl-4">
                            Discover the next generation of esports talent. Filter through thousands of verified warriors ready for battle.
                        </p>
                    </div>

                    <div className="flex items-center self-start lg:self-center">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                            <div className="relative flex items-center gap-6 px-10 py-6 rounded-3xl bg-[#0d091a]/80 border border-white/5 backdrop-blur-xl">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Total Warriors</p>
                                    <p className="text-4xl font-black text-white italic tracking-tighter">{totalCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="mb-16">
                    <PlayerFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedRole={selectedRole}
                        onRoleChange={setSelectedRole}
                        isVerified={isVerified}
                        onVerifiedChange={setIsVerified}
                        hasTeam={hasTeam}
                        onHasTeamChange={setHasTeam}
                    />
                </div>

                {/* Players Grid */}
                {players && players.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence mode="popLayout">
                            {players.map((player, index) => (
                                <PlayerCard key={player._id} player={player} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 text-center space-y-6 rounded-[2.5rem] bg-white/[0.01] border border-dashed border-white/10 backdrop-blur-sm"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <Search className="w-10 h-10 text-white/10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">No Warriors Detected</h3>
                                <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Try adjusting your filters or search terms.</p>
                            </div>
                        </motion.div>
                    )
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-[450px] rounded-[2rem] bg-white/[0.02] animate-pulse border border-white/5" />
                        ))}
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && players && players.length > 0 && (
                    <div className="mt-20 flex justify-center">
                        <Button
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="group relative h-14 px-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 overflow-hidden transition-all duration-500 shadow-2xl shadow-violet-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/10 to-violet-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-violet-400 transition-colors flex items-center gap-3">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Load More Warriors
                                        <span className="text-violet-500">↓</span>
                                    </>
                                )}
                            </span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindPlayers;
