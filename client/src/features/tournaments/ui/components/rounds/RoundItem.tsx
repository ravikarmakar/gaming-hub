import { memo } from 'react';
import { Edit, Trash2, CheckCircle2, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoundItemProps {
    round: any;
    isSelected: boolean;
    isSidebarCollapsed: boolean;
    activeRoundTab: string;
    onSelect: (id: string) => void;
    onEditClick: (round: any) => void;
    onDeleteClick: (round: any) => void;
}

export const RoundItem = memo(({ round, isSelected, isSidebarCollapsed, activeRoundTab, onSelect, onEditClick, onDeleteClick }: RoundItemProps) => {
    return (
        <div
            onClick={() => onSelect(round._id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(round._id);
                }
            }}
            tabIndex={0}
            role="button"
            className={`
                rounded-xl cursor-pointer transition-all border group outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                ${isSidebarCollapsed ? "p-2 flex justify-center" : "p-4"}
                ${isSelected
                    ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-900/20'
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                }
            `}
            title={isSidebarCollapsed ? round.roundName : ""}
            aria-selected={isSelected}
        >
            {isSidebarCollapsed ? (
                <div className="flex flex-col items-center justify-center h-8">
                    <div className="relative">
                        <span className={`font-black text-sm tracking-tighter ${isSelected ? 'text-purple-300' : 'text-gray-400'}`}>
                            R{round.roundNumber || "?"}
                        </span>
                        {round.status === 'ongoing' && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-green-500 animate-pulse border border-black" />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold ${isSelected ? 'text-purple-300' : 'text-gray-300'}`}>
                                {round.roundName}
                            </span>
                            {round.status === 'ongoing' && (
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            {(round.roadmapData?.isLeague || round.roadmapData?.isFinale) && (round.roadmapData?.leagueType || round.roadmapData?.grandFinaleType) && (
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-tight flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    {(round.roadmapData?.leagueType || round.roadmapData?.grandFinaleType).replace("-", " ").toUpperCase()}
                                </span>
                            )}
                            <div className="flex flex-wrap gap-2 mt-0.5">
                                {round.mergeInfo && (
                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                        <GitMerge className="w-3 h-3" />
                                        {round.mergeInfo.type === 'merges-into' ? (
                                            <span>
                                                Merges into {round.mergeInfo.targetLabel}
                                                {round.mergeInfo.targetTitle && <span className="text-amber-400 ml-1">({round.mergeInfo.targetTitle})</span>}
                                            </span>
                                        ) : (
                                            <div className="flex flex-col gap-0.5">
                                                {round.mergeInfo.sources.map((s: any) => (
                                                    <span key={s.name || s.roundId} className="flex items-center gap-1">
                                                        <span className={s.type === 't1-special' ? 'text-blue-400' : 'text-purple-400'}>
                                                            {s.type === 't1-special' ? 'T1:' : 'Invited:'}
                                                        </span>
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                        {!round.isPlaceholder && round.status === 'completed' && (
                            <div className="bg-green-500/10 p-1 rounded-full border border-green-500/20">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                        )}
                        {!round.isPlaceholder && round.status !== 'completed' && activeRoundTab !== 't1-special' && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                                    onClick={(e) => { e.stopPropagation(); onEditClick(round); }}
                                    aria-label={`Edit ${round.roundName}`}
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={(e) => { e.stopPropagation(); onDeleteClick(round); }}
                                    aria-label={`Delete ${round.roundName}`}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

RoundItem.displayName = 'RoundItem';
