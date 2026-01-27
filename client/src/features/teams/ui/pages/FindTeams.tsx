import React, { useEffect, useState, useCallback } from "react";
import { useTeamStore } from "../../store/useTeamStore";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, RefreshCcw } from "lucide-react";
import TeamCard from "../components/TeamCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TeamFilters from "../components/TeamFilters";

const FindTeams: React.FC = () => {
    const { paginatedTeams, pagination, isLoading, fetchTeams } = useTeamStore();
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState<string | undefined>();
    const [isRecruiting, setIsRecruiting] = useState<boolean | undefined>();
    const [isVerified, setIsVerified] = useState<boolean | undefined>();

    const loadTeams = useCallback((page: number = 1, append: boolean = false) => {
        fetchTeams({
            page,
            search,
            region,
            isRecruiting,
            isVerified,
            append,
        });
    }, [fetchTeams, search, region, isRecruiting, isVerified]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            loadTeams(1, false);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, region, isRecruiting, isVerified, loadTeams]);

    const handleLoadMore = () => {
        if (pagination.hasMore && !isLoading) {
            loadTeams(pagination.currentPage + 1, true);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setRegion(undefined);
        setIsRecruiting(undefined);
        setIsVerified(undefined);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#0a0514] relative overflow-hidden">
            {/* Background Ambient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 80, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-indigo-600/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-900/10 blur-[100px]"
                />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-400 mb-4 tracking-tight"
                    >
                        Find Your Squad
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-purple-200/60 max-w-2xl mx-auto"
                    >
                        Browse through competitive teams or filter to find the perfect fit for your playstyle.
                    </motion.p>
                </div>

                {/* Search & Filters */}
                <div className="max-w-4xl mx-auto mb-12 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/50 group-focus-within:text-purple-400 transition-colors" />
                            <Input
                                type="text"
                                placeholder="Search by team name or tag..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 h-14 bg-white/5 border-purple-500/20 focus:border-purple-500/50 text-white rounded-2xl text-lg transition-all"
                            />
                        </div>

                        <TeamFilters
                            selectedRegion={region}
                            onRegionChange={setRegion}
                            isRecruiting={isRecruiting}
                            onRecruitingChange={setIsRecruiting}
                            isVerified={isVerified}
                            onVerifiedChange={setIsVerified}
                        />

                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="h-14 px-6 text-purple-300 hover:text-white hover:bg-purple-500/10 rounded-2xl border border-purple-500/10"
                        >
                            <RefreshCcw className="w-5 h-5 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Team Grid */}
                <AnimatePresence mode="popLayout">
                    {paginatedTeams.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {paginatedTeams.map((team, index) => (
                                <TeamCard key={team._id} team={team} index={index} />
                            ))}
                        </motion.div>
                    ) : !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                                <Search className="w-10 h-10 text-purple-400/50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No teams found</h3>
                            <p className="text-purple-200/60">Try adjusting your filters or search terms.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State & Load More */}
                <div className="mt-12 flex justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-purple-400 text-sm font-medium">Scanning Nexus...</p>
                        </div>
                    ) : pagination.hasMore && (
                        <Button
                            onClick={handleLoadMore}
                            className="h-12 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all duration-300 active:scale-95"
                        >
                            Load More Teams
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindTeams;
