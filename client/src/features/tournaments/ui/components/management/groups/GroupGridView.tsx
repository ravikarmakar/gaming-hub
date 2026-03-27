import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FixedSizeGrid, GridChildComponentProps } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { Button } from "@/components/ui/button";
import { GroupCard } from "./GroupCard";
import { useTournamentDialogs } from "@/features/tournaments/context/TournamentDialogContext";

import { useGroupsContext } from "@/features/tournaments/context/TournamentGroupsContext";

const MemoizedGroupCard = React.memo(GroupCard);

const GridCell = ({
    columnIndex,
    rowIndex,
    style,
    data
}: GridChildComponentProps) => {
    const {
        groups,
        columnCount,
        roundMatches,
        setSelectedGroupId,
        onResetGroup,
        onMergeToGroup,
        activeRoundTab,
        round
    } = data;

    const { openDialog } = useTournamentDialogs();

    const index = rowIndex * columnCount + columnIndex;
    const group = groups[index];

    if (!group) return null;

    return (
        <div style={{ ...style, padding: '0 12px', boxSizing: 'border-box' }}>
            <div className="h-full">
                <MemoizedGroupCard
                    group={group}
                    roundMatches={roundMatches}
                    onSelect={setSelectedGroupId}
                    onEdit={() => openDialog('editGroup', group)}
                    onDelete={() => openDialog('deleteGroup', group)}
                    onChat={() => openDialog('groupChat', group)}
                    onInvite={() => openDialog('addTeam', group)}
                    onReset={onResetGroup}
                    onMerge={() => onMergeToGroup(group._id)}
                    activeRoundTab={activeRoundTab}
                    round={round}
                />
            </div>
        </div>
    );
};

export const GroupGridView = () => {
    const {
        groups,
        roundMatches,
        setSelectedGroupId,
        totalGroups,
        currentPage,
        totalPages,
        isLoading,
        handlePageChange,
        handleResetGroup: onResetGroup,
        handleMergeToGroup: onMergeToGroup,
        activeRoundTab,
        roundId,
        rounds
    } = useGroupsContext();

    const round = rounds.find(r => r._id === roundId) || null;

    return (
        <div className="space-y-4">
            <div className="bg-transparent overflow-hidden h-[600px]">
                <AutoSizer renderProp={({ width, height }) => {
                    let columnCount = 1;
                    if (width && width >= 1280) columnCount = 4;
                    else if (width && width >= 1024) columnCount = 3;
                    else if (width && width >= 768) columnCount = 2;

                    const rowCount = Math.ceil(groups.length / columnCount);
                    const columnWidth = width ? width / columnCount : 0;

                    const itemData = {
                        groups,
                        columnCount,
                        roundMatches,
                        setSelectedGroupId,
                        onResetGroup,
                        onMergeToGroup,
                        activeRoundTab,
                        round
                    };

                    return (
                        <FixedSizeGrid
                            columnCount={columnCount}
                            columnWidth={columnWidth}
                            rowCount={rowCount}
                            rowHeight={280}
                            height={height || 600}
                            width={width || 800}
                            style={{ overflowX: 'hidden' }}
                            itemData={itemData}
                        >
                            {GridCell}
                        </FixedSizeGrid>
                    );
                }}
                />
            </div>

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
                            className="bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-purple-500/30 hover:bg-purple-600 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages || isLoading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-purple-500/30 hover:bg-purple-600 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
