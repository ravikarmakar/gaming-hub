import { useEffect, useState, useMemo } from "react";
import { Trophy, Search } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useEventStore } from "@/features/events/store/useEventStore";
import { GlassCard, SectionHeader } from "@/features/events/ui/components/ThemedComponents";
import { TournamentGrid } from "@/features/events/ui/components/TournamentGrid";
import { categoryOptions } from "../../lib/constants";


const AllTournaments = () => {
    const { fetchAllEvents, events, isLoading } = useEventStore();

    const [search, setSearch] = useState("");
    const [gameFilter, setGameFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        fetchAllEvents();
    }, [fetchAllEvents]);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch =
                event.title.toLowerCase().includes(search.toLowerCase()) ||
                event.game.toLowerCase().includes(search.toLowerCase());
            const matchesGame = gameFilter === "all" || event.game.toLowerCase() === gameFilter.toLowerCase();
            const matchesCategory =
                categoryFilter === "all" || event.category.toLowerCase() === categoryFilter.toLowerCase();

            return matchesSearch && matchesGame && matchesCategory;
        });
    }, [events, search, gameFilter, categoryFilter]);

    const uniqueGames = useMemo(() => {
        const games = new Set(events.map((e) => e.game));
        return Array.from(games);
    }, [events]);

    return (
        <div className="pt-20 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 -left-4 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none -ml-40 -mt-40" />
            <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none -mr-40" />
            <div className="absolute bottom-40 -left-4 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[200px] pointer-events-none -ml-60" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[180px] pointer-events-none -mr-40 -mb-40" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header & Stats Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    <div className="lg:col-span-2">
                        <SectionHeader
                            title="Tournament Hub"
                            icon={Trophy}
                        />
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Browse through our curated list of competitive tournaments and scrims.
                            Filter by game or category to find your next challenge.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-end gap-12">
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Prize Pool</p>
                            <p className="text-3xl font-black text-white">$120,450</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Active Arenas</p>
                            <p className="text-3xl font-black text-white">{events.length}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <GlassCard className="p-4 mb-12 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tournaments, games, or arenas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Select value={gameFilter} onValueChange={setGameFilter}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white focus:ring-purple-500/50 rounded-xl h-12">
                                <SelectValue placeholder="All Games" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                <SelectItem value="all">All Games</SelectItem>
                                {uniqueGames.map((game: any) => (
                                    <SelectItem key={game} value={game}>{game}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white focus:ring-purple-500/50 rounded-xl h-12">
                                <SelectValue placeholder="Categories" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categoryOptions.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </GlassCard>

                {/* Tournament Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <GlassCard key={i} className="h-[420px] animate-pulse">
                                <div className="h-48 bg-white/5" />
                                <div className="p-6 space-y-4">
                                    <div className="h-6 w-3/4 bg-white/5 rounded" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                                    <div className="pt-4 flex justify-between">
                                        <div className="h-10 w-24 bg-white/5 rounded" />
                                        <div className="h-10 w-24 bg-white/5 rounded" />
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <TournamentGrid events={filteredEvents} />
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-block p-6 bg-white/5 rounded-full mb-6 italic text-gray-500">
                            <Search size={48} className="opacity-20" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Tournaments Found</h3>
                        <p className="text-gray-400">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllTournaments;
