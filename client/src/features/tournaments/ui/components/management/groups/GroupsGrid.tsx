import { SearchX, RotateCcw, Users } from "lucide-react";
import { GroupGridView } from "./GroupGridView";
import { GroupDetailsView } from "./GroupDetailsView";
import { useTournamentDashboard } from "@/features/tournaments/context/TournamentDashboardContext";
import { useGroupsContext } from "@/features/tournaments/context/TournamentGroupsContext";
import { TournamentLoading, TournamentEmpty } from "@/features/tournaments/ui/components";

/**
 * GroupsGrid is the main entry point for group management.
 * It is now a thin wrapper as all state logic has been moved to TournamentGroupsContext.
 */
export const GroupsGrid = () => {
    return (
        <GroupsGridContent />
    );
};

const GroupsGridContent = () => {
    const { onResetFilters, search, statusFilter } = useTournamentDashboard();
    
    // All these now come from context in the children, 
    // but the main component still needs top-level loading/empty state.
    const {
        groups,
        isLoading,
        isFetching,
        selectedGroupId,
    } = useGroupsContext();

    if ((isLoading || isFetching) && groups.length === 0 && !selectedGroupId) {
        return <TournamentLoading />;
    }

    if (!isLoading && !isFetching && groups.length === 0) {
        if (search || statusFilter) {
            return (
                <TournamentEmpty
                    message="No matches found"
                    subMessage="We couldn't find any groups matching your current filters."
                    icon={SearchX}
                    action={onResetFilters && (
                        <button
                            onClick={onResetFilters}
                            className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Clear Filters
                        </button>
                    )}
                />
            );
        }

        return (
            <TournamentEmpty
                message="No groups found"
                subMessage="Create groups to get started with the tournament brackets."
                icon={Users}
            />
        );
    }

    return (
        <div className="space-y-6">
            {selectedGroupId ? (
                <GroupDetailsView />
            ) : (
                <GroupGridView />
            )}
        </div>
    );
};
