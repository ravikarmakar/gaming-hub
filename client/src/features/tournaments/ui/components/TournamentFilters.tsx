import { Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { categoryOptions } from "@/features/tournaments/lib/constants";

interface TournamentFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    gameFilter: string;
    setGameFilter: (game: string) => void;
    categoryFilter: string;
    setCategoryFilter: (category: string) => void;
    uniqueGames: string[];
}

export const TournamentFilters = ({
    searchTerm,
    setSearchTerm,
    gameFilter,
    setGameFilter,
    categoryFilter,
    setCategoryFilter,
    uniqueGames,
}: TournamentFiltersProps) => {
    return (
        <GlassCard className="p-4 mb-12 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search tournaments, games, or arenas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search tournaments"
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
                        {uniqueGames.filter((g) => g.trim()).map((game) => (
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
    );
};
