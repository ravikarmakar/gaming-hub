import { Info, Clock, Trophy, Users } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";

interface RoundInfoTooltipProps {
    round: any;
}

export const RoundInfoTooltip = ({ round }: RoundInfoTooltipProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button className="text-gray-500 hover:text-blue-400 transition-colors">
                        <Info className="w-4 h-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="w-64 bg-gray-900 border-white/10 p-0 overflow-hidden shadow-2xl">
                    <div className="bg-blue-500/10 px-3 py-2 border-b border-white/5 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Round Configuration</span>
                    </div>
                    <div className="p-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Start Date</p>
                                <p className="text-[11px] text-gray-200 font-medium">
                                    {round.startTime ? formatDate(round.startTime) : 'Not scheduled'}
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Daily Window</p>
                                <p className="text-[11px] text-gray-200 font-medium flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 text-gray-500" />
                                    {round.dailyStartTime || "13:00"} - {round.dailyEndTime || "21:00"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Match Gap</p>
                                <p className="text-[11px] text-gray-200 font-medium">{round.gapMinutes || 0} Min</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Matches / Group</p>
                                <p className="text-[11px] text-gray-200 font-medium">{round.matchesPerGroup || 1}</p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-purple-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                                    <Trophy className="w-2.5 h-2.5" /> Qualification
                                </p>
                                <p className="text-[11px] text-white font-black">Top {round.qualifyingTeams ?? "N/A"}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                    <Users className="w-2.5 h-2.5" /> Group Size
                                </p>
                                <p className="text-[11px] text-gray-200 font-medium">{round.groupSize || 12} Teams</p>
                            </div>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
