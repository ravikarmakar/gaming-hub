import { ArrowLeft, Clock, Users, Swords, ChevronLeft, ChevronRight, MessageSquare, CheckCircle2, UserPlus, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupActionsMenu } from "./GroupActionsMenu";
import { GroupStatusIndicator } from "./GroupStatusIndicator";
import { QualificationMonitor } from "./QualificationMonitor";
import { Group } from "@/features/tournaments/types";

interface GroupDetailsHeaderProps {
    currentGroup: Group | undefined;
    onBack: () => void;
    onPrevGroup: () => void;
    onNextGroup: () => void;
    hasPrevGroup: boolean;
    hasNextGroup: boolean;
    qualifyingTeams: number;
    qualifiedCount: number;

    currentGroupIndex?: number;
    totalGroupsCount?: number;
    isResultsMode: boolean;
    onEnterResults: () => void;
    onCancelResults: () => void;
    onSubmitResults: () => void;
    onInviteTeam: () => void;
    onEditGroup: (group: Group) => void;
    onDeleteGroup: (group: Group) => void;
    onResetGroup?: (group: Group) => void;
    isSubmitting: boolean;
    isSubmitDisabled?: boolean;
    isLoading?: boolean;
    onChat?: (group: Group) => void;
    totalMatch?: number;
    showMerge?: boolean;
    onMerge?: () => void;
}

export const GroupDetailsHeader = ({
    currentGroup,
    onBack,
    onPrevGroup,
    onNextGroup,
    hasPrevGroup,
    hasNextGroup,
    qualifyingTeams,
    qualifiedCount,

    currentGroupIndex,
    totalGroupsCount,
    isResultsMode,
    onEnterResults,
    onCancelResults,
    onSubmitResults,
    onInviteTeam,
    onEditGroup,
    onDeleteGroup,
    onResetGroup,
    isSubmitting,
    isSubmitDisabled,
    isLoading,
    onChat,
    totalMatch,
    showMerge,
    onMerge
}: GroupDetailsHeaderProps) => {


    if (!currentGroup) return null;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 border border-white/5 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="group h-10 w-10 rounded-xl bg-transparent hover:bg-white/5 transition-all flex items-center justify-center shrink-0"
                >
                    <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </Button>

                <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight leading-none">
                            {currentGroup.groupName}
                        </h2>
                        <GroupStatusIndicator status={currentGroup.status} />
                    </div>
                    <div className="flex items-center gap-4">
                        {currentGroup.matchTime && (
                            <>
                                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{new Date(currentGroup.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="h-3 w-px bg-white/10" />
                            </>
                        )}
                        <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[9px]">
                            <Users className="w-3 h-3 text-indigo-400" />
                            <span>{currentGroup.teams?.length || 0} Teams</span>
                        </div>
                        {!currentGroup.isLeague && (
                            <>
                                <div className="h-3 w-px bg-white/10" />
                                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[9px]">
                                    <Swords className="w-3 h-3 text-indigo-400" />
                                    <span>{currentGroup.matchesPlayed || 0}/{totalMatch ?? currentGroup.totalMatch ?? 0} Matches</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <QualificationMonitor
                    qualifiedCount={qualifiedCount}
                    targetCount={qualifyingTeams}
                    label='Qualified'
                />

                <div className="flex items-center gap-2 bg-transparent rounded-xl">
                    {!isResultsMode ? (
                        <>
                            {currentGroup.status !== 'completed' && (
                                <Button
                                    onClick={onEnterResults}
                                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center gap-1.5"
                                >
                                    <Swords className="w-3.5 h-3.5" />
                                    Results
                                </Button>
                            )}

                            {currentGroup.status === 'pending' &&
                                (currentGroup.teams?.length || 0) < (currentGroup.groupSize || 12) && (
                                    <Button
                                        onClick={onInviteTeam}
                                        className="h-9 px-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center gap-1.5"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Add Team
                                    </Button>
                                )}
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={onCancelResults}
                                disabled={isSubmitting}
                                className="h-9 px-4 text-gray-400 hover:text-white font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onSubmitResults}
                                disabled={isSubmitting || isSubmitDisabled}
                                className="h-9 px-6 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center gap-1.5"
                            >
                                {isSubmitting ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                Submit
                            </Button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 bg-transparent rounded-xl">
                    <Button
                        variant="ghost"
                        onClick={() => onChat?.(currentGroup)}
                        className="h-8 w-8 rounded-lg bg-transparent hover:bg-white/10 transition-all p-0 text-indigo-400"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </Button>
                    <div className="h-6 w-px bg-white/5 mx-0.5" />
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPrevGroup}
                            disabled={!hasPrevGroup || isLoading}
                            className="h-8 w-8 rounded-lg bg-transparent hover:bg-white/10 transition-all text-gray-400 hover:text-white p-0 disabled:opacity-20"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="px-1.5 min-w-[40px] flex items-center justify-center">
                            {isLoading ? (
                                <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                            ) : (
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.1em] tabular-nums">
                                    {(currentGroupIndex || 0) > 0 ? currentGroupIndex : "-"}<span className="text-gray-700 mx-0.5">/</span>{totalGroupsCount || "-"}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNextGroup}
                            disabled={!hasNextGroup || isLoading}
                            className="h-8 w-8 rounded-lg bg-transparent hover:bg-white/10 transition-all text-gray-400 hover:text-white p-0 disabled:opacity-20"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="h-6 w-px bg-white/5 mx-0.5" />
                    <GroupActionsMenu 
                        group={currentGroup} 
                        onEdit={onEditGroup} 
                        onDelete={onDeleteGroup} 
                        onReset={onResetGroup}
                        showMerge={showMerge}
                        onMerge={onMerge}
                    />

                </div>
            </div>
        </div>
    );
};
