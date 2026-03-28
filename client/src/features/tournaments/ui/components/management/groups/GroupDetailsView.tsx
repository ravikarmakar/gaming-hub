import { useState, useEffect } from "react";

import { GroupDetailsHeader } from "./GroupDetailsHeader";
import { LeaguePairingSelector } from "./LeaguePairingSelector";
import { GroupLeaderboardTable } from "./GroupLeaderboardTable";
import { useTournamentDialogs } from "@/features/tournaments/context/TournamentDialogContext";
import { useGroupsContext } from "@/features/tournaments/context/TournamentGroupsContext";


export const GroupDetailsView = () => {
    const {
        currentGroup,
        leaderboard,
        setSelectedGroupId,
        effectiveTotalMatch,
        qualifyingTeams,
        isResultsMode,
        setIsResultsMode,
        handleSubmitResults,
        isSaving,
        tempResults,
        handleResultChange,
        activeRoundTab,
        selectedPairing,
        setSelectedPairing,
        handleNextGroup: onNextGroup,
        handlePreviousGroup: onPreviousGroup,
        hasNextGroup,
        hasPreviousGroup,
        handleResetGroup: onResetGroup,
        currentGroupIndex,
        totalGroupsCount,
        isLeaderboardLoading: isLoading,
        showMerge,
    } = useGroupsContext();

    const { openDialog } = useTournamentDialogs();
    // Stash the last valid leaderboard to prevent "blinking" empty state during navigation
    const [stashedLeaderboard, setStashedLeaderboard] = useState<any>(null);

    const openMergeModal = (team?: any) => openDialog('mergeTeamToGroup', team || currentGroup);


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
        <div className="space-y-2">
            <GroupDetailsHeader
                currentGroup={currentGroup}
                onBack={() => setSelectedGroupId(null)}
                onPrevGroup={() => onPreviousGroup?.()}
                onNextGroup={() => onNextGroup?.()}
                hasPrevGroup={!!hasPreviousGroup}
                hasNextGroup={!!hasNextGroup}
                qualifyingTeams={qualifyingTeams}
                qualifiedCount={qualifiedCount}
                currentGroupIndex={currentGroupIndex}
                totalGroupsCount={totalGroupsCount}
                isResultsMode={isResultsMode}
                onEnterResults={() => setIsResultsMode(true)}
                onCancelResults={() => {
                    setIsResultsMode(false);
                    setSelectedPairing(null);
                }}
                onSubmitResults={handleSubmitResults}
                onInviteTeam={() => openDialog('addTeam', currentGroup)}
                onEditGroup={() => openDialog('editGroup', currentGroup)}
                onDeleteGroup={() => openDialog('deleteGroup', currentGroup)}
                onResetGroup={onResetGroup}
                isSubmitting={isSaving}
                isSubmitDisabled={currentGroup.isLeague && !selectedPairing}
                isLoading={isLoading}
                onChat={() => openDialog('groupChat', currentGroup)}
                totalMatch={effectiveTotalMatch}
                showMerge={showMerge}
                onMerge={openMergeModal}
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
