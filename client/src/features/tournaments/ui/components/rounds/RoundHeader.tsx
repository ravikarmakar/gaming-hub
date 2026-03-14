import { Plus, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoundHeaderProps {
    round: any;
    activeRoundTab: string;
    isSavingStatus: boolean;
    isCreatingSingleGroup: boolean;
    isCreatingGroups: boolean;
    isMergingTeams?: boolean;
    cooldown: number;
    isCreateDisabled: boolean;
    onComplete: () => Promise<void>;
    onStart: () => void;
    onMergeTeams?: () => void;
    onCreateGroup: () => void;
    onRefresh: () => void;
    onCreateGroups: () => void;
}

export const RoundHeader = ({
    round,
    activeRoundTab,
    isSavingStatus,
    isCreatingSingleGroup,
    isCreatingGroups,
    isMergingTeams,
    cooldown,
    isCreateDisabled,
    onComplete,
    onStart,
    onMergeTeams,
    onCreateGroup,
    onRefresh,
    onCreateGroups
}: RoundHeaderProps) => {
    // Check if there are any mappings for this round
    const hasMappings = round.mergeInfo?.hasInvitedMapping || round.mergeInfo?.hasT1Mapping;
    const isMainRoadmap = activeRoundTab === 'tournament';

    return (
        <div className="h-14 px-6 flex items-center border-b border-white/5 bg-black/10">
            <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <h2 className="text-base font-black text-white uppercase tracking-tight leading-none truncate">
                            {round.roundName}
                        </h2>
                        <Badge variant="secondary" className={`
                            shrink-0 text-[9px] h-4 px-1.5 font-black border uppercase tracking-tighter pointer-events-none
                            ${activeRoundTab === 'invited-tournament'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : activeRoundTab === 't1-special'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }
                        `}>
                            {round.isPlaceholder ? "NOT STARTED" : activeRoundTab === 't1-special' ? "T1 SPECIAL" : round.status.toUpperCase()}
                        </Badge>
                        {(round.roadmapData?.isLeague || round.roadmapData?.isFinale) && (round.roadmapData?.leagueType || round.roadmapData?.grandFinaleType) && (
                            <Badge variant="outline" className="shrink-0 text-[10px] h-4 px-1.5 font-black border-white/10 text-gray-400 uppercase tracking-tighter pointer-events-none bg-white/5">
                                {(round.roadmapData?.leagueType || round.roadmapData?.grandFinaleType).replaceAll("-", " ")}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!round.isPlaceholder && round.status !== 'completed' && (
                        <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Progress</span>
                                <span className="text-sm font-black text-white">
                                    {(round.groups || []).filter((g: any) => g.status === 'completed').length}
                                    <span className="text-gray-600 mx-1">/</span>
                                    {(round.groups || []).length}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Groups</span>
                            </div>

                            {(round.groups || []).length > 0 &&
                                (round.groups || []).every((g: any) => g.status === 'completed') && (
                                    <Button
                                        size="sm"
                                        onClick={onComplete}
                                        disabled={isSavingStatus}
                                        className={`h-7 text-[10px] px-3 font-black uppercase tracking-wider animate-bounce hover:animate-none ${activeRoundTab === 'invited-tournament' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                                    >
                                        {isSavingStatus ? (
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                        )}
                                        Complete Round
                                    </Button>
                                )}
                        </div>
                    )}

                    {round.isPlaceholder ? (
                        <Button
                            size="sm"
                            onClick={onStart}
                            disabled={isCreateDisabled}
                            className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wide"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Start this Round
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1">
                            {round.status === 'completed' ? (
                                <div className="flex items-center gap-6 px-4 py-1.5 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Groups</p>
                                        <p className="text-sm font-black text-white leading-none">{(round.groups || []).length}</p>
                                    </div>
                                    <div className="h-4 w-px bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest">Qualified</p>
                                        <p className="text-sm font-black text-purple-400 leading-none drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]">
                                            {(round.groups || []).reduce((acc: number, g: any) => acc + (g.totalSelectedTeam || 0), 0)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {isMainRoadmap && hasMappings && round.status === 'pending' && (!round.groups || round.groups.length === 0) && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onMergeTeams?.()}
                                            disabled={isMergingTeams}
                                            className="h-8 text-xs font-bold border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4"
                                        >
                                            {isMergingTeams ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                            Merge Roadmap Teams
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        onClick={onCreateGroup}
                                        disabled={isCreatingSingleGroup}
                                        title="Create One Group"
                                        className="h-8 w-8 p-0 transition-all duration-300 bg-transparent text-gray-400 hover:bg-purple-600/20 hover:text-purple-400 border border-white/5 hover:border-purple-500/30"
                                    >
                                        {isCreatingSingleGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={onRefresh}
                                        disabled={cooldown > 0}
                                        title="Refresh"
                                        className={`
                                            h-8 w-8 p-0 transition-all duration-300
                                            ${cooldown > 0
                                                ? 'bg-purple-900/20 text-purple-400 border border-purple-500/10'
                                                : 'bg-transparent text-gray-400 hover:bg-purple-600/20 hover:text-purple-400 border border-white/5 hover:border-purple-500/30'
                                            } 
                                        `}
                                    >
                                        {cooldown > 0 ? (
                                            <span className="flex items-center justify-center">
                                                {cooldown}
                                            </span>
                                        ) : (
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        )}
                                    </Button>

                                    {(!round.groups || round.groups.length === 0) && (
                                        <Button
                                            size="sm"
                                            onClick={onCreateGroups}
                                            disabled={isCreatingGroups}
                                            className={`h-8 text-xs font-bold ${activeRoundTab === 'invited-tournament' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-4`}
                                        >
                                            {isCreatingGroups ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4 mr-2" />
                                            )}
                                            Create Groups
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
