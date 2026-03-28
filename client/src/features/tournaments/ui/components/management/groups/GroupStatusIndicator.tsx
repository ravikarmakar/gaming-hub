import { CircleCheckBig as CircleCheck2, Activity, Clock } from "lucide-react";

interface GroupStatusIndicatorProps {
    status: 'pending' | 'ongoing' | 'completed' | 'cancelled' | undefined;
}

export const GroupStatusIndicator = ({ status }: GroupStatusIndicatorProps) => {
    switch (status) {
        case 'completed':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                    <CircleCheck2 className="w-3 h-3 text-green-400" />
                    <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Finished</span>
                </div>
            );
        case 'ongoing':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Live</span>
                </div>
            );
        case 'cancelled':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Cancelled</span>
                </div>
            );
        case 'pending':
        default:
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Pending</span>
                </div>
            );
    }
};
