import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FixedSizeGrid, GridChildComponentProps } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { Button } from "@/components/ui/button";
import { GroupCard } from "./GroupCard";
import { Group } from "@/features/tournaments/types";

interface GroupGridViewProps {
    groups: Group[];
    roundMatches: number | undefined;
    setSelectedGroupId: (id: string | null) => void;
    openEditModal: (group: Group) => void;
    openDeleteModal: (group: Group) => void;
    openChatModal: (group: Group) => void;
    openInviteModal: (group: Group) => void;
    totalGroups: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    handlePageChange: (page: number) => void;
    onResetGroup?: (group: Group) => void;
    onMergeToGroup: (id: string) => void;
    activeRoundTab: string;
    round: any;

}

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
        openEditModal, 
        openDeleteModal, 
        openChatModal, 
        openInviteModal, 
        onResetGroup,
        onMergeToGroup, 
        activeRoundTab, 
        round
    } = data;
    
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
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onChat={openChatModal}
                    onInvite={openInviteModal}
                    onReset={onResetGroup}
                    onMerge={() => onMergeToGroup(group._id)}
                    activeRoundTab={activeRoundTab}
                    round={round}

                />
            </div>
        </div>
    );
};

export const GroupGridView = ({
    groups,
    roundMatches,
    setSelectedGroupId,
    openEditModal,
    openDeleteModal,
    openChatModal,
    openInviteModal,
    totalGroups,
    currentPage,
    totalPages,
    isLoading,
    handlePageChange,
    onResetGroup,
    onMergeToGroup,
    activeRoundTab,
    round
}: GroupGridViewProps) => {
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

                    const itemData = React.useMemo(() => ({
                        groups,
                        columnCount,
                        roundMatches,
                        setSelectedGroupId,
                        openEditModal,
                        openDeleteModal,
                        openChatModal,
                        openInviteModal,
                        onResetGroup,
                        onMergeToGroup,
                        activeRoundTab,
                        round
                    }), [groups, columnCount, roundMatches, setSelectedGroupId, openEditModal, openDeleteModal, openChatModal, openInviteModal, onMergeToGroup, activeRoundTab, round]);

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
