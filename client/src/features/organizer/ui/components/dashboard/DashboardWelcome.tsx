import { Trophy } from "lucide-react";
import { GlassCard, NeonBadge } from "@/features/events/ui/components/ThemedComponents";

interface DashboardWelcomeProps {
    username?: string;
}

export const DashboardWelcome = ({ username }: DashboardWelcomeProps) => {
    return (
        <GlassCard className="lg:col-span-2 p-8 relative overflow-hidden group border-purple-500/10" gradient>
            <div className="absolute top-0 right-0 p-12 transition-transform duration-1000 opacity-5 -mr-12 -mt-12 group-hover:scale-110 group-hover:-rotate-12">
                <Trophy size={200} className="text-purple-500" />
            </div>

            <div className="relative z-10">
                <div className="mb-6">
                    <NeonBadge variant="purple">Organizer Dashboard</NeonBadge>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tighter">
                    Hello, <span className="text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text drop-shadow-sm">{username}</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-lg leading-relaxed font-medium">
                    Manage your tournaments, track participants, and grow your esports community from one centralized command center.
                </p>
            </div>
        </GlassCard>
    );
};
