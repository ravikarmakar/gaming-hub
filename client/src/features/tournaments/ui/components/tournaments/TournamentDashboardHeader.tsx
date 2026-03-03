import { Trophy, PlayCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TournamentDashboardHeaderProps {
    title: string;
    registrationStatus: string;
    eventProgress: string;
    onStartEvent: () => void;
    onFinishEvent: () => void;
    canFinish: boolean;
    isFinishing: boolean;
}

export const TournamentDashboardHeader = ({
    title,
    registrationStatus,
    eventProgress,
    onStartEvent,
    onFinishEvent,
    canFinish,
    isFinishing
}: TournamentDashboardHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                        {title || "Loading..."}
                    </h1>
                    <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10">
                        {registrationStatus?.toUpperCase() || "LOADING"}
                    </Badge>
                    <Badge variant="outline" className="border-blue-500/20 text-blue-400 bg-blue-500/10">
                        {eventProgress?.toUpperCase() || "LOADING"}
                    </Badge>
                </div>
                <p className="text-gray-400">Managing arena operations and results</p>
            </div>

            <div className="flex gap-3">
                {eventProgress === "pending" && (
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={onStartEvent}
                    >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Event
                    </Button>
                )}

                {eventProgress === "ongoing" && (
                    <Button
                        variant="outline"
                        className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onFinishEvent}
                        disabled={!canFinish || isFinishing}
                    >
                        {isFinishing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Trophy className="w-4 h-4 mr-2" />
                        )}
                        Finish Tournament
                    </Button>
                )}
            </div>
        </div>
    );
};
