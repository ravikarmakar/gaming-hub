import { Trophy } from "lucide-react";
import { GroupLeaderboardTable } from "@/features/tournaments/ui/components/management/groups/GroupLeaderboardTable";

interface ResultsTabProps {
    leaderboard: any;
}

export function ResultsTab({ leaderboard }: ResultsTabProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {leaderboard ? (
                <GroupLeaderboardTable
                    leaderboard={leaderboard}
                    isResultsMode={false}
                    tempResults={{}}
                    handleResultChange={() => { }}
                    activeRoundTab="main"
                    openMergeModal={() => { }}
                    isGrandFinale={true}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-2">
                        <Trophy size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Awaiting Finalization</h3>
                    <p className="text-gray-500 max-w-sm text-sm">Tournament results are being verified by the Arena Master. Final standings will be broadcasted shortly.</p>
                </div>
            )}
        </div>
    );
}
