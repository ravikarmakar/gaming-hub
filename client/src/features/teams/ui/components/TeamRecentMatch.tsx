import { cn } from "@/lib/utils";

interface TeamRecentMatchProps {
    opponent: string;
    result: "win" | "loss" | "draw";
    score: string;
    date: string;
    map: string;
}

export const TeamRecentMatch = ({ opponent, result, score, date, map }: TeamRecentMatchProps) => {
    const resultColors = {
        win: "text-emerald-400",
        loss: "text-red-400",
        draw: "text-amber-400",
    };

    const resultBgs = {
        win: "bg-emerald-500/10",
        loss: "bg-red-500/10",
        draw: "bg-amber-500/10",
    };

    return (
        <div className="flex items-center justify-between p-4 border bg-white/5 border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors duration-200">
            <div className="flex items-center space-x-4">
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase",
                    resultBgs[result],
                    resultColors[result]
                )}>
                    {result[0]}
                </div>
                <div>
                    <p className="font-semibold text-white">
                        {opponent}
                    </p>
                    <p className="text-xs text-gray-400">
                        {map} • {date}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-base font-bold text-white">
                    {score}
                </p>
                <p className={cn("text-xs font-medium uppercase", resultColors[result])}>
                    {result}
                </p>
            </div>
        </div>
    );
};
