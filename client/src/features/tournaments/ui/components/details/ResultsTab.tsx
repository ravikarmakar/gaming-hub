import { Trophy, AlertTriangle, RefreshCw } from "lucide-react";
import { GroupLeaderboardTable } from "@/features/tournaments/ui/components/management/groups/GroupLeaderboardTable";
import { useGetRoundsQuery, useGetGroupsQuery, useGetLeaderboardQuery } from "@/features/tournaments/hooks";
import { Button } from "@/components/ui/button";

interface ResultsTabProps {
    eventId: string;
}

export function ResultsTab({ eventId }: ResultsTabProps) {
    const { 
        data: rounds = [], 
        isLoading: isRoundsLoading,
        isError: isRoundsError,
        refetch: refetchRounds
    } = useGetRoundsQuery(eventId);
    
    const lastRound = rounds[rounds.length - 1];

    const { 
        data: groupsData, 
        isLoading: isGroupsLoading,
        isError: isGroupsError,
        refetch: refetchGroups
    } = useGetGroupsQuery(lastRound?._id || "", 1, 1, "", "", "", {
        enabled: !!lastRound?._id
    });
    
    const grandFinaleGroup = groupsData?.groups?.[0];

    const { 
        data: leaderboard, 
        isLoading: isLeaderboardLoading,
        isError: isLeaderboardError,
        refetch: refetchLeaderboard
    } = useGetLeaderboardQuery(grandFinaleGroup?._id || "", {
        enabled: !!grandFinaleGroup?._id
    });

    const isLoading = isRoundsLoading || (!!lastRound && isGroupsLoading) || (!!grandFinaleGroup && isLeaderboardLoading);
    const isError = isRoundsError || isGroupsError || isLeaderboardError;

    const handleRetry = () => {
        if (isRoundsError) refetchRounds();
        if (isGroupsError) refetchGroups();
        if (isLeaderboardError) refetchLeaderboard();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Reconstructing Standings...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-rose-500/[0.02] border border-rose-500/10 rounded-3xl group">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2 group-hover:scale-110 transition-transform duration-500">
                    <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Signal Interrupted</h3>
                    <p className="text-gray-500 max-w-xs text-xs font-medium leading-relaxed">We encountered a recursive error while fetching the final standings. The transmission remains unstable.</p>
                </div>
                <Button 
                    onClick={handleRetry}
                    variant="outline" 
                    className="border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase tracking-widest text-[10px] h-10 px-8 rounded-xl transition-all"
                >
                    <RefreshCw size={14} className="mr-2" />
                    Retry Uplink
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {leaderboard && grandFinaleGroup?.status === 'completed' ? (
                <GroupLeaderboardTable
                    leaderboard={leaderboard}
                    isResultsMode={false}
                    tempResults={{}}
                    handleResultChange={() => { }}
                    activeRoundTab="main"
                    openMergeModal={() => { }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10 group">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-2 group-hover:scale-110 transition-transform duration-500">
                        <Trophy size={32} className="group-hover:text-amber-500/50 transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Awaiting Finalization</h3>
                        <p className="text-gray-500 max-w-sm text-xs font-medium leading-relaxed">Tournament results are being verified by the Arena Master. Final standings will be broadcasted shortly.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
