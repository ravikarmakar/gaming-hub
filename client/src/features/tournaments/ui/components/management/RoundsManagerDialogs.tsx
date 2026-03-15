import React from 'react';
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { CreateRoundDialog } from "./rounds/CreateRoundDialog";
import { ResetRoundDialog } from "./rounds/ResetRoundDialog";
import { EditRoundDialog } from "./rounds/EditRoundDialog";
import { Round, RoundTabType } from "@/features/tournaments/types";

interface RoundsManagerDialogsProps {
    eventId: string;
    activeRoundTab: RoundTabType;
    actionRound: Round | null;
    setActionRound: (round: Round | null) => void;
    isCreateRoundOpen: boolean;
    setIsCreateRoundOpen: (open: boolean) => void;
    isEditRoundOpen: boolean;
    setIsEditRoundOpen: (open: boolean) => void;
    isResetRoundOpen: boolean;
    setIsResetRoundOpen: (open: boolean) => void;
    isConfirmGroupsOpen: boolean;
    setIsConfirmGroupsOpen: (open: boolean) => void;
    isConfirmManualGroupOpen: boolean;
    setIsConfirmManualGroupOpen: (open: boolean) => void;
    isConfirmMergeOpen: boolean;
    setIsConfirmMergeOpen: (open: boolean) => void;
    selectedRound: Round | null;
    setSelectedRoundId: (id: string) => void;
    teamPreview: any;
    isCreatingGroups: boolean;
    isCreatingSingleGroup: boolean;
    isMergingTeams: boolean;
    handleCreateGroups: (roundId: string) => Promise<void>;
    handleManualCreateGroup: (roundId: string) => Promise<void>;
    handleMergeTeams: (roundId: string) => Promise<void>;
}

export const RoundsManagerDialogs: React.FC<RoundsManagerDialogsProps> = ({
    eventId,
    activeRoundTab,
    actionRound,
    setActionRound,
    isCreateRoundOpen,
    setIsCreateRoundOpen,
    isEditRoundOpen,
    setIsEditRoundOpen,
    isResetRoundOpen,
    setIsResetRoundOpen,
    isConfirmGroupsOpen,
    setIsConfirmGroupsOpen,
    isConfirmManualGroupOpen,
    setIsConfirmManualGroupOpen,
    isConfirmMergeOpen,
    setIsConfirmMergeOpen,
    selectedRound,
    setSelectedRoundId,
    teamPreview,
    isCreatingGroups,
    isCreatingSingleGroup,
    isMergingTeams,
    handleCreateGroups,
    handleManualCreateGroup,
    handleMergeTeams,
}) => {
    return (
        <>
            <CreateRoundDialog
                open={isCreateRoundOpen}
                onOpenChange={setIsCreateRoundOpen}
                eventId={eventId}
                type={activeRoundTab}
                roadmapIndex={actionRound?.roadmapIndex}
                initialName={actionRound?.roundName}
                onSuccess={setSelectedRoundId}
            />
            
            {actionRound && !actionRound.isPlaceholder && (
                <>
                    <EditRoundDialog
                        open={isEditRoundOpen}
                        onOpenChange={setIsEditRoundOpen}
                        roundId={actionRound._id}
                        eventId={eventId}
                        initialName={actionRound.roundName}
                        initialQualifyingTeams={actionRound.qualifyingTeams}
                        initialMatchesPerGroup={actionRound.matchesPerGroup}
                        initialStartTime={actionRound.startTime}
                        initialDailyStartTime={actionRound.dailyStartTime}
                        initialDailyEndTime={actionRound.dailyEndTime}
                        initialGapMinutes={actionRound.gapMinutes}
                        initialGroupSize={actionRound.groupSize}
                        initialIsLeague={actionRound.isLeague}
                        initialLeaguePairingType={actionRound.leaguePairingType}
                    />
                    <ResetRoundDialog
                        open={isResetRoundOpen}
                        onOpenChange={setIsResetRoundOpen}
                        roundId={actionRound._id}
                        eventId={eventId}
                        roundName={actionRound.roundName}
                        onReset={() => {
                            setSelectedRoundId(actionRound._id);
                            setActionRound(null);
                        }}
                    />
                </>
            )}

            <ConfirmActionDialog
                open={isConfirmGroupsOpen}
                onOpenChange={setIsConfirmGroupsOpen}
                title="Generate Groups?"
                description={
                    <div className="space-y-4">
                        <p>This will automatically generate groups for <strong className="text-white">{selectedRound?.roundName}</strong> based on the available team data.</p>

                        <div className="grid grid-cols-2 gap-3">
                            {teamPreview && (
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                        {(teamPreview as any).mainLabel}
                                    </p>
                                    <p className="text-xl font-black text-purple-400">
                                        {(teamPreview as any).mainCount ?? (teamPreview as any).count}
                                    </p>
                                </div>
                            )}

                            {(teamPreview as any)?.invitedCount > 0 && (teamPreview as any).sources.map((source: any, idx: number) => (
                                <div key={idx} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex flex-col justify-center">
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">
                                        Qualified from {source.sourceRoundName || source.name}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-black text-blue-400">{source.mergedCount || 0}</p>
                                        {source.pendingCount > 0 && (
                                            <p className="text-[10px] text-amber-500 font-bold">
                                                +{source.pendingCount} Pending
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-blue-500/60 font-medium truncate italic">
                                        {source.name}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {teamPreview && ((teamPreview as any).totalCount || (teamPreview as any).mainCount) && (
                            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Total Participating Teams</span>
                                <span className="text-xl font-black text-white">{(teamPreview as any)?.totalCount || (teamPreview as any)?.mainCount} Teams</span>
                            </div>
                        )}

                        {teamPreview && (teamPreview as any).hasPending && (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <RefreshCw className="w-3 h-3" />
                                            Merge Roadmap Teams
                                        </span>
                                        <span className="text-[10px] text-indigo-400/60 font-medium ml-5">
                                            Merges into {(teamPreview as any).currentRoundName}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={!(teamPreview as any).isReady || isMergingTeams}
                                        onClick={(e) => { e.stopPropagation(); setIsConfirmMergeOpen(true); }}
                                        className="h-7 px-3 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold"
                                    >
                                        {(teamPreview as any).isReady ? "Merge Now" : "Locked"}
                                    </Button>
                                </div>

                                {!(teamPreview as any).isReady ? (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-3">
                                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                        <p className="text-[11px] text-red-400 font-bold leading-relaxed">
                                            Please complete all mapped rounds in the following roadmaps first: {(teamPreview as any).unreadySources?.join(", ") || "Active Roadmaps"}.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                        The "Generate" button is disabled until you merge invited teams to ensure data integrity.
                                    </p>
                                )}
                            </div>
                        )}

                        <p className="text-sm text-gray-500 italic">
                            {(teamPreview as any)?.hasPending ? "Merge teams to enable generation." : "Are you sure you want to proceed?"}
                        </p>
                    </div>
                }
                actionLabel="Generate"
                confirmDisabled={!!(teamPreview as any)?.hasPending}
                onConfirm={async () => {
                    if (selectedRound) await handleCreateGroups(selectedRound._id);
                    setIsConfirmGroupsOpen(false);
                }}
                isLoading={isCreatingGroups}
                variant="default"
            />

            <ConfirmActionDialog
                open={isConfirmManualGroupOpen}
                onOpenChange={setIsConfirmManualGroupOpen}
                title="Create One New Group?"
                description={
                    <div className="space-y-4">
                        <p>Are you sure you want to create <strong className="text-white">one new group</strong> manually in <strong className="text-white">{selectedRound?.roundName}</strong>?</p>
                        <p className="text-xs text-gray-500 italic">This will create an empty group with default settings. You can add teams to it later.</p>
                    </div>
                }
                actionLabel="Create Group"
                onConfirm={async () => {
                    if (selectedRound) await handleManualCreateGroup(selectedRound._id);
                    setIsConfirmManualGroupOpen(false);
                }}
                isLoading={isCreatingSingleGroup}
                variant="default"
            />

            <ConfirmActionDialog
                open={isConfirmMergeOpen}
                onOpenChange={setIsConfirmMergeOpen}
                title="Merge Roadmap Teams?"
                description={
                    <div className="space-y-4">
                        <p>Are you sure you want to merge qualified teams from other roadmaps into <strong className="text-white">{selectedRound?.roundName}</strong>?</p>
                        {selectedRound?.mergeInfo?.sources && (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Sources:</p>
                                <ul className="space-y-1">
                                    {selectedRound.mergeInfo.sources.map((s: any, idx: number) => (
                                        <li key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                            <span className="font-bold">{s.name}</span>
                                            <span className="text-gray-500 italic">({s.type})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 italic">This will pull all currently qualified teams. You can run this again if more teams qualify later.</p>
                    </div>
                }
                actionLabel="Merge Teams"
                onConfirm={async () => {
                    if (selectedRound) await handleMergeTeams(selectedRound._id);
                    setIsConfirmMergeOpen(false);
                }}
                isLoading={isMergingTeams}
                variant="default"
            />
        </>
    );
};
