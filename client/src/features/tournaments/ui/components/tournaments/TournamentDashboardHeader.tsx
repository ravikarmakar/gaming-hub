import { PlayCircle, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TournamentDashboardHeaderProps {
    title: string;
    registrationStatus: string;
    eventProgress: string;
    eventType?: string;
    onStartEvent: () => void;
    onBack: () => void;
}

export const TournamentDashboardHeader = ({
    title,
    registrationStatus,
    eventProgress,
    eventType,
    onStartEvent,
    onBack,
}: TournamentDashboardHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-transparent border-b border-white/5 mb-6 pb-2">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={onBack}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
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
                        {eventType === "scrims" ? "Start Scrim" : "Start Tournament"}
                    </Button>
                )}

            </div>
        </div>
    );
};

