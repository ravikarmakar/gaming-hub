import { Users, Trophy, Building2, Activity, Zap } from "lucide-react";
import { MetricCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";

interface StatsGridProps {
    stats: {
        totalUsers: number;
        totalTeams: number;
        totalOrgs: number;
        totalMatches: number;
        activeUsers: number;
    } | null;
}

const StatsGrid = ({ stats }: StatsGridProps) => {
    const items = [
        {
            title: "Total Users",
            value: stats?.totalUsers ?? "...",
            icon: Users,
            color: "text-blue-400",
        },
        {
            title: "Total Teams",
            value: stats?.totalTeams ?? "...",
            icon: Trophy,
            color: "text-yellow-400",
        },
        {
            title: "Total Organizers",
            value: stats?.totalOrgs ?? "...",
            icon: Building2,
            color: "text-green-400",
        },
        {
            title: "Live Matches",
            value: stats?.totalMatches ?? "...",
            icon: Activity,
            color: "text-red-400",
        },
        {
            title: "Active Users",
            value: stats?.activeUsers ?? "...",
            icon: Zap,
            color: "text-purple-400",
            trend: "Real-time",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {items.map((item) => (
                <MetricCard
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    value={item.value}
                    color={item.color}
                    trend={item.trend}
                    className="border-white/5"
                />
            ))}
        </div>
    );
};

export default StatsGrid;
