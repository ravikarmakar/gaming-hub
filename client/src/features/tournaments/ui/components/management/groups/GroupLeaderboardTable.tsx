import { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { LeaderboardRow } from "./LeaderboardRow";

import { Leaderboard } from "@/features/tournaments/types";

interface GroupLeaderboardTableProps {
    leaderboard: Leaderboard;
    isResultsMode: boolean;
    tempResults: Record<string, { kills: number, rank: number }>;
    handleResultChange: (teamId: string, field: 'kills' | 'rank', value: number) => void;
    activeRoundTab: string;
    openMergeModal: (team: any) => void;
    // League sub-group pairing — when set, teams outside the active pairing are dimmed
    selectedPairing?: 'AxB' | 'BxC' | 'AxC' | null;
    isLeague?: boolean;
    subGroupTeamSets?: Record<string, Set<string>>; // {"Sub-Group A": Set<id>, ...}
}

export const GroupLeaderboardTable = ({
    leaderboard,
    isResultsMode,
    tempResults,
    handleResultChange,
    activeRoundTab,
    openMergeModal,
    selectedPairing,
    isLeague = false,
    subGroupTeamSets,
}: GroupLeaderboardTableProps) => {

    const sortedScores = useMemo(() => {
        if (!leaderboard?.teamScore) return [];
        return [...leaderboard.teamScore].sort((a, b) => {
            if (a.isQualified !== b.isQualified) return a.isQualified ? -1 : 1;
            return b.totalPoints - a.totalPoints;
        });
    }, [leaderboard?.teamScore]);

    const allTeamIds = useMemo(() => sortedScores.map(t => t.teamId._id), [sortedScores]);

    // Grid tracking for consistent column widths
    const gridTemplate = `80px 1fr ${isLeague ? '100px ' : ''}100px 100px 120px 120px ${activeRoundTab === 't1-special' ? '150px' : ''}`;

    // Dynamic height: show up to 18 teams (18 * 64px = 1152px), capped for viewport safety
    const maxVisibleTeams = 18;
    const rowHeight = 64;
    const calculatedHeight = Math.min(sortedScores.length * rowHeight, maxVisibleTeams * rowHeight);

    const rowData = {
        sortedScores,
        isResultsMode,
        tempResults,
        handleResultChange,
        activeRoundTab,
        openMergeModal,
        selectedPairing,
        isLeague,
        subGroupTeamSets,
        allTeamIds,
        gridTemplate
    };

    return (
        <div
            className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-lg flex flex-col transition-all duration-500"
            style={{ height: sortedScores.length > 0 ? `${calculatedHeight + 52}px` : '300px' }} // +52 for header
        >
            {/* Thread Header (Sticky-like via Flex) */}
            <div
                className="grid text-[10px] text-gray-400 uppercase bg-gradient-to-b from-black/60 to-black/40 border-b border-white/10 shrink-0 h-[52px]"
                style={{ gridTemplateColumns: gridTemplate }}
            >
                <div className="px-6 py-4 text-center font-black tracking-widest">Rank</div>
                <div className="px-6 py-4 font-black tracking-widest text-left">Team Profile</div>
                {isLeague && <div className="px-4 py-4 text-center font-black tracking-widest">Grp</div>}
                <div className="px-6 py-4 text-center font-black tracking-widest">Played</div>
                <div className="px-6 py-4 text-center font-black tracking-widest">Pos Pts</div>
                <div className="px-6 py-4 text-center font-black tracking-widest">Kill Pts</div>
                <div className="px-6 py-4 text-center font-black tracking-widest">Total Pts</div>
                {activeRoundTab === 't1-special' && <div className="px-6 py-4 text-center font-black tracking-widest">Operations</div>}
            </div>

            {/* Scrollable Virtualized Body */}
            <div className="flex-1 min-h-0">
                {sortedScores.length > 0 ? (
                    <AutoSizer renderProp={({ height, width }: { height?: number; width?: number }) => (
                        <List
                            height={height || calculatedHeight}
                            width={width || 1000}
                            itemCount={sortedScores.length}
                            itemSize={rowHeight}
                            itemData={rowData}
                            className="scrollbar-hide"
                        >
                            {LeaderboardRow}
                        </List>
                    )} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 font-black uppercase tracking-[0.2em] text-[10px] py-12">
                        No combatants deployed to this sector
                    </div>
                )}
            </div>
        </div>
    );
};
