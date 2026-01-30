
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTournamentStore } from "@/features/organizer/store/useTournamentStore";

interface GroupsGridProps {
    roundId: string;
}

export const GroupsGrid = ({ roundId }: GroupsGridProps) => {
    const {
        groups,
        isLoading,
        fetchGroups,
        currentPage,
        totalPages,
        totalGroups
    } = useTournamentStore();

    useEffect(() => {
        if (roundId) {
            fetchGroups(roundId, currentPage);
        }
    }, [roundId, currentPage, fetchGroups]);

    const handlePageChange = (newPage: number) => {
        fetchGroups(roundId, newPage);
    };

    if (isLoading && groups.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!isLoading && groups.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-500">
                No groups found. Create groups to get started.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-gray-900/40 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {groups.map((group) => (
                        <div
                            key={group._id}
                            className="bg-black/40 border border-white/5 p-4 rounded-lg hover:border-purple-500/30 transition-colors group cursor-pointer"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-200">{group.groupName}</h4>
                                <Badge variant="secondary" className="text-xs bg-white/5 text-gray-400 group-hover:bg-purple-500/10 group-hover:text-purple-300">
                                    {group.teams?.length || 0} Teams
                                </Badge>
                            </div>

                            <div className="space-y-1 mb-4">
                                {group.teams?.slice(0, 3).map((team) => (
                                    <div key={team._id} className="text-xs text-gray-500 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                                        {team.teamName}
                                    </div>
                                ))}
                                {(group.teams?.length || 0) > 3 && (
                                    <div className="text-xs text-gray-600 pl-3.5">
                                        + {(group.teams?.length || 0) - 3} more
                                    </div>
                                )}
                            </div>

                            <Button size="sm" className="w-full h-8 text-xs bg-white/5 hover:bg-white/10 text-gray-300">
                                <Eye className="w-3 h-3 mr-2" />
                                View Details
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalGroups > 0 && (
                <div className="flex items-center justify-between p-2">
                    <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages} ({totalGroups} Groups)
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1 || isLoading}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="bg-transparent border-white/10 text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages || isLoading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="bg-transparent border-white/10 text-gray-400 hover:text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};