import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface TournamentControlBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    gameFilter: string;
    onGameFilterChange: (value: string) => void;
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    uniqueGames: string[];
}

export const TournamentControlBar = ({
    search,
    onSearchChange,
    gameFilter,
    onGameFilterChange,
    categoryFilter,
    onCategoryFilterChange,
    statusFilter,
    onStatusFilterChange,
    uniqueGames
}: TournamentControlBarProps) => {
    return (
        <Card className="p-4 bg-gray-900/40 border-gray-800 backdrop-blur-xl ring-1 ring-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-purple-400" />
                    <Input
                        placeholder="Search tournaments..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/40 transition-all rounded-lg"
                    />
                </div>

                <Select value={gameFilter} onValueChange={onGameFilterChange}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-purple-500/40 rounded-lg">
                        <SelectValue placeholder="All Games" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                        <SelectItem value="all">All Games</SelectItem>
                        {uniqueGames.map((game) => (
                            <SelectItem key={game} value={game}>{game}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-purple-500/40 rounded-lg">
                        <SelectValue placeholder="All Formats" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                        <SelectItem value="all">All Formats</SelectItem>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="duo">Duo</SelectItem>
                        <SelectItem value="squad">Squad</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-purple-500/40 rounded-lg">
                        <SelectValue placeholder="All Phases" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                        <SelectItem value="all">All Phases</SelectItem>
                        <SelectItem value="registration-open">Registration Open</SelectItem>
                        <SelectItem value="registration-closed">Registration Closed</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </Card>
    );
};
