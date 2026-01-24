import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface TournamentItemProps {
    name: string;
    date: string;
    prize: string | number;
    status: "upcoming" | "ongoing" | "completed" | "eliminated";
    placement?: number;
}

export const TournamentItem = ({ name, date, prize, status, placement }: TournamentItemProps) => {
    const statusStyles = {
        ongoing: "bg-red-500/10 text-red-400",
        upcoming: "bg-blue-500/10 text-blue-400",
        completed: "bg-purple-500/10 text-purple-400",
        eliminated: "bg-gray-500/10 text-gray-400",
    };

    const getPlacementIcon = () => {
        if (!placement) return null;
        if (placement === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
        if (placement === 2) return <Medal className="w-4 h-4 text-gray-300" />;
        if (placement === 3) return <Award className="w-4 h-4 text-amber-600" />;
        return null;
    };

    return (
        <div className="p-4 border bg-white/5 border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors duration-200">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        {placement && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5">
                                {getPlacementIcon()}
                            </div>
                        )}
                        <h3 className="text-sm font-semibold text-white">
                            {name}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-400">
                        {date}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <p className="text-base font-bold text-emerald-400">
                        {typeof prize === 'number' ? `$${prize.toLocaleString()}` : prize}
                    </p>
                    <span className={cn(
                        "text-xs font-medium uppercase px-2 py-1 rounded-md",
                        statusStyles[status]
                    )}>
                        {status}
                    </span>
                </div>
            </div>
        </div>
    );
};
