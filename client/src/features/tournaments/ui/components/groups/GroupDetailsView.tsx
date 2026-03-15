import { useState, useEffect } from "react";

import { Group } from "@/features/tournaments/types";
import { GroupDetailsHeader } from "./GroupDetailsHeader";
import { LeaguePairingSelector } from "./LeaguePairingSelector";
import { GroupLeaderboardTable } from "./GroupLeaderboardTable";

interface GroupDetailsViewProps {
    currentGroup: Group | undefined;
    leaderboard: any;
    setSelectedGroupId: (id: string | null) => void;
    effectiveTotalMatch: number;
    isGroupCompleted: boolean;
    qualifyingTeams: number;
    isResultsMode: boolean;
    setIsResultsMode: (mode: boolean) => void;
    handleSubmitResults: () => void;
    isSaving: boolean;
    openInviteModal: (group: Group) => void;
    tempResults: Record<string, { kills: number, rank: number }>;
    handleResultChange: (teamId: string, field: 'kills' | 'rank', value: number) => void;
    activeRoundTab: string;
    openMergeModal: (team: any) => void;
    selectedPairing: 'AxB' | 'BxC' | 'AxC' | null;
    setSelectedPairing: (pairing: 'AxB' | 'BxC' | 'AxC' | null) => void;
    onNextGroup?: () => void;
    onPreviousGroup?: () => void;
    hasNextGroup?: boolean;
    hasPreviousGroup?: boolean;
    openEditModal: (group: Group) => void;
    openDeleteModal: (group: Group) => void;
    openChatModal: (group: Group) => void;
    currentGroupIndex?: number;
    totalGroupsCount?: number;
    isLoading?: boolean;
    isGrandFinale?: boolean;
}

export const GroupDetailsView = ({
    currentGroup,
    leaderboard,
    setSelectedGroupId,
    effectiveTotalMatch,
    qualifyingTeams,
    isResultsMode,
    setIsResultsMode,
    handleSubmitResults,
    isSaving,
    openInviteModal,
    tempResults,
    handleResultChange,
    activeRoundTab,
    openMergeModal,
    selectedPairing,
    setSelectedPairing,
    onNextGroup,
    onPreviousGroup,
    hasNextGroup,
    hasPreviousGroup,
    openEditModal,
    openDeleteModal,
    currentGroupIndex,
    totalGroupsCount,
    isLoading,
    isGrandFinale,
}: GroupDetailsViewProps) => {
    // Stash the last valid leaderboard to prevent "blinking" empty state during navigation
    const [stashedLeaderboard, setStashedLeaderboard] = useState<any>(null);

    useEffect(() => {
        if (leaderboard && !isLoading) {
            setStashedLeaderboard(leaderboard);
        }
    }, [leaderboard, isLoading]);

    // Use the active leaderboard if available, otherwise fallback to the current one
    const activeLeaderboard = isLoading ? stashedLeaderboard || leaderboard : leaderboard;

    // Stability: Only return null if currentGroup is missing. 
    // If leaderboard is missing (e.g. during fast navigation), we keep the shell mounted.
    if (!currentGroup) return null;

    // Build sub-group → team id set mapping (for dimming in the table)
    const subGroupTeamSets: Record<string, Set<string>> = {};
    if (currentGroup?.subGroups?.length) {
        currentGroup.subGroups.forEach((sg: any) => {
            const name = sg.name;
            const teamIds = sg.teams
                .map((t: any) => {
                    if (typeof t === 'string') return t;
                    return t?._id?.toString() || t?.id?.toString();
                })
                .filter(Boolean);
            subGroupTeamSets[name] = new Set(teamIds);
        });
    }

    // Calculate qualified count from leaderboard if available, fallback to group teams
    const qualifiedCount = (activeLeaderboard?.teamScore || activeLeaderboard)?.filter?.((t: any) => t.isQualified).length || 
                           currentGroup?.teams?.filter((t: any) => t.isQualified).length || 0;

    return (
        <div className="space-y-4">
            <GroupDetailsHeader
                currentGroup={currentGroup}
                onBack={() => setSelectedGroupId(null)}
                onPrevGroup={() => onPreviousGroup?.()}
                onNextGroup={() => onNextGroup?.()}
                hasPrevGroup={!!hasPreviousGroup}
                hasNextGroup={!!hasNextGroup}
                qualifyingTeams={qualifyingTeams}
                qualifiedCount={qualifiedCount}
                isGrandFinale={isGrandFinale}
                currentGroupIndex={currentGroupIndex}
                totalGroupsCount={totalGroupsCount}
                isResultsMode={isResultsMode}
                onEnterResults={() => setIsResultsMode(true)}
                onCancelResults={() => {
                    setIsResultsMode(false);
                    setSelectedPairing(null);
                }}
                onSubmitResults={handleSubmitResults}
                onInviteTeam={() => openInviteModal(currentGroup)}
                onEditGroup={openEditModal}
                onDeleteGroup={openDeleteModal}
                isSubmitting={isSaving}
                isLoading={isLoading}
            />

            {currentGroup.isLeague && isResultsMode && (
                <LeaguePairingSelector
                    selectedPairing={selectedPairing}
                    onPairingChange={setSelectedPairing}
                    pairingMatches={currentGroup.pairingMatches}
                    effectiveTotalMatch={effectiveTotalMatch}
                />
            )}

            <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
                <GroupLeaderboardTable
                    leaderboard={activeLeaderboard}
                    isResultsMode={isResultsMode}
                    tempResults={tempResults}
                    handleResultChange={handleResultChange}
                    activeRoundTab={activeRoundTab}
                    openMergeModal={openMergeModal}
                    selectedPairing={selectedPairing}
                    isLeague={currentGroup?.isLeague}
                    subGroupTeamSets={subGroupTeamSets}
                />
            </div>
        </div>
    );
};
