import { GlassCard } from "@/features/tournaments/ui/components/ThemedComponents";

interface Activity {
    type: string;
    desc: string;
    time: string;
}

interface ActivityLogProps {
    activities: Activity[];
}

export const ActivityLog = ({ activities }: ActivityLogProps) => {
    return (
        <GlassCard className="p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                Recent Ops Log
            </h3>
            <div className="space-y-6 relative ml-1">
                <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-white/5" />
                {activities.map((activity, idx) => (
                    <div key={idx} className="relative pl-6">
                        <div className="absolute left-[-2.5px] top-1.5 w-[5px] h-[5px] rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-300 uppercase tracking-tight">
                                {activity.type}: <span className="text-gray-500 normal-case font-medium">{activity.desc}</span>
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};
