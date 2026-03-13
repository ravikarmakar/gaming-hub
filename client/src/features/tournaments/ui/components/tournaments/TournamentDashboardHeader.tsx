import { Trophy, PlayCircle, Loader2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TournamentDashboardHeaderProps {
    title: string;
    registrationStatus: string;
    eventProgress: string;
    onStartEvent: () => void;
    onFinishEvent: () => void;
    onBack: () => void;
    canFinish: boolean;
    isFinishing: boolean;
}

export const TournamentDashboardHeader = ({
    title,
    registrationStatus,
    eventProgress,
    onStartEvent,
    onFinishEvent,
    onBack,
    canFinish,
    isFinishing
}: TournamentDashboardHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/40 p-3 md:p-4 rounded-xl border border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg md:text-xl font-black text-white tracking-tight">
                            {title || "Loading..."}
                        </h1>
                        <div className="flex items-center gap-1.5 ml-1">
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-green-500/20 text-green-400 bg-green-500/10 font-bold uppercase">
                                {registrationStatus || "LOADING"}
                            </Badge>
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-blue-500/20 text-blue-400 bg-blue-500/10 font-bold uppercase">
                                {eventProgress || "LOADING"}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">Managing arena operations and results</p>
                </div>
            </div>

            <div className="flex gap-2">
                {eventProgress === "pending" && (
                    <Button
                        size="sm"
                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-bold"
                        onClick={onStartEvent}
                    >
                        <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                        Start Event
                    </Button>
                )}

                {eventProgress === "ongoing" && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-purple-500/20 text-purple-400 hover:bg-purple-500/10 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onFinishEvent}
                        disabled={!canFinish || isFinishing}
                    >
                        {isFinishing ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <Trophy className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Finish Tournament
                    </Button>
                )}
            </div>
        </div>
    );
};

