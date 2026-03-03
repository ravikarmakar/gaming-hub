import { Calendar, Tag, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard, NeonBadge } from "@/features/events/ui/components/ThemedComponents";

interface DashboardProfileProps {
    orgInfo: any;
    fallbackName?: string;
}

export const DashboardProfile = ({ orgInfo, fallbackName }: DashboardProfileProps) => {
    return (
        <GlassCard className="p-8 flex flex-col items-center text-center border-purple-500/10">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                <Avatar className="w-24 h-24 border-2 border-purple-500/20 relative z-10">
                    <AvatarImage src={orgInfo?.imageUrl} alt={orgInfo?.name} />
                    <AvatarFallback className="bg-purple-500/10 text-purple-400 text-2xl font-bold">
                        {orgInfo?.name?.[0] || fallbackName?.[0]}
                    </AvatarFallback>
                </Avatar>
            </div>

            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{orgInfo?.name || "Organization"}</h2>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <NeonBadge variant="purple" className="flex items-center gap-1.5 lowercase">
                    <Tag size={10} /> {orgInfo?.tag || "@org"}
                </NeonBadge>
                {orgInfo?.isHiring && (
                    <NeonBadge variant="green" className="flex items-center gap-1.5 h-auto">
                        <Briefcase size={10} /> Hiring
                    </NeonBadge>
                )}
            </div>

            <div className="w-full space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                        <Calendar size={12} /> Created
                    </span>
                    <span className="text-gray-300 font-medium">
                        {orgInfo?.createdAt ? new Date(orgInfo.createdAt).toLocaleDateString() : 'Jan 20, 2026'}
                    </span>
                </div>
            </div>
        </GlassCard>
    );
};
