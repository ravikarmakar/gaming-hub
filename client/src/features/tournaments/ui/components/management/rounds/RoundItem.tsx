import { memo } from 'react';
import { Edit, Trash2, CircleCheckBig as CircleCheck2, Clock, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTournamentDialogs } from '@/features/tournaments/context/TournamentDialogContext';

interface RoundItemProps {
    round: any;
    isSelected?: boolean;
    isSidebarCollapsed?: boolean;
    activeRoundTab?: string;
    onSelect?: (id: string) => void;
    isReadOnly?: boolean;
}

export const RoundItem = memo(({
    round,
    isSelected = false,
    isSidebarCollapsed = false,
    onSelect,
    isReadOnly = false
}: RoundItemProps) => {
    const { openDialog } = useTournamentDialogs();

    const handleSelect = () => {
        if (!isReadOnly && onSelect) onSelect(round._id);
    };

    const formatRoundName = (name: string, number: number) => {
        if (!name) return "";
        const n = number || 0;
        const roundPrefixRegex = new RegExp(`^(?:R${n}\\s*[:-]?\\s*)?Round\\s*${n}\\s*[:-]?\\s*`, 'i');
        return name.replace(roundPrefixRegex, '').trim() || name;
    };

    const isLeague = round.isLeague || round.roadmapData?.isLeague;
    const leagueType = round.leagueType || round.roadmapData?.leagueType || round.roadmapData?.grandFinaleType;

    return (
        <div
            onClick={handleSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect();
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
                        {round.status === 'completed' && (
                            <CircleCheck2 className="absolute -top-1 -right-1.5 w-3 h-3 text-green-500 bg-black rounded-full" />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {isReadOnly ? (
                            <div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">
                                    Round {round.roundNumber || "?"}
                                </p>
                                <h4 className={`text-lg font-black tracking-tight ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                                    {formatRoundName(round.roundName, round.roundNumber)}
                                </h4>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold ${isSelected ? 'text-purple-300' : 'text-gray-300'}`}>
                                    {round.roundNumber ? `R${round.roundNumber} - ` : ""}{formatRoundName(round.roundName, round.roundNumber)}
                                </span>
                                {round.status === 'ongoing' && (
                                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                )}
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                {(isLeague || !isReadOnly) && (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black tracking-widest uppercase border ${isLeague
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                        }`}>
                                        {isLeague ? "League" : "Standard"}
                                    </span>
                                )}
                                {leagueType && (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black tracking-widest uppercase border ${isLeague
                                        ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                                        : "bg-white/5 border-white/10 text-gray-500"
                                        }`}>
                                        {leagueType.replace("-", " ").toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Merge Configuration Info */}
                            {round.mergeInfo && (
                                <div className="mt-1 flex flex-col gap-1">
                                    {round.mergeInfo.type === 'merges-into' && (
                                        <div className="flex items-center gap-1.5">
                                            <GitMerge className="w-3 h-3 text-indigo-500" />
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest whitespace-nowrap">
                                                Merges into {round.mergeInfo.targetLabel}{round.mergeInfo.targetTitle ? ` - ${round.mergeInfo.targetTitle}` : ""}
                                            </p>
                                        </div>
                                    )}
                                    {round.mergeInfo.type === 'receives-from' && (round.mergeInfo.sources?.length || 0) > 0 && (
                                        <div className="flex flex-col gap-1 mt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <GitMerge className="w-3 h-3 text-sky-500" />
                                                <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest">
                                                    Receives Teams From
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {round.mergeInfo.sources.map((s: any, i: number) => (
                                                    <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-[4px] bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold whitespace-nowrap">
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                        {round.status === 'completed' ? (
                            <div className="bg-green-500/10 p-1 rounded-full border border-green-500/20">
                                <CircleCheck2 className="w-4 h-4 text-green-500" />
                            </div>
                        ) : round.status === 'ongoing' ? (
                            <span className="text-[8px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                Ongoing
                            </span>
                        ) : (
                            <span className="text-[8px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase bg-white/5 border border-white/10 text-white/20">
                                Not Started
                            </span>
                        )}
                        {!isReadOnly && !round.isPlaceholder && round.status !== 'completed' && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-400/50 hover:text-purple-400 hover:bg-purple-500/10"
                                    onClick={(e) => { e.stopPropagation(); openDialog('editRound', round); }}
                                    aria-label="Edit timing and scheduling"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                                    onClick={(e) => { e.stopPropagation(); openDialog('editRound', round); }}
                                    aria-label={`Edit ${round.roundName} name and settings`}
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </Button>
                                {(round.groups?.length || 0) > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={(e) => { e.stopPropagation(); openDialog('resetRound', round); }}
                                        aria-label={`Delete ${round.roundName}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

RoundItem.displayName = 'RoundItem';
