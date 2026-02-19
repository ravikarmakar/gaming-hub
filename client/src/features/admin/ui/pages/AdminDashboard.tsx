import { Activity, Shield, LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import StatsGrid from "@/features/admin/ui/components/StatsGrid";
import { useAdminStats } from "@/features/admin/hooks/useAdminStats";
import ManagementTables from "@/features/admin/ui/components/ManagementTables";
import { GlassCard, SectionHeader, NeonBadge } from "@/features/events/ui/components/ThemedComponents";

const AdminDashboard = () => {
    const { stats, isConnected } = useAdminStats();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="mb-2">
                        <NeonBadge variant="purple">Platform Command Center</NeonBadge>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1 font-medium">Real-time platform metrics and ecosystem monitoring.</p>
                </div>

                <div className="flex items-center gap-3">
                    <GlassCard className="px-4 py-2 border-purple-500/10 flex items-center gap-3">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isConnected ? "bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-400"
                        )} />
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            isConnected ? "text-green-400" : "text-red-400"
                        )}>
                            {isConnected ? "Socket Live" : "Offline"}
                        </span>
                    </GlassCard>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1 font-mono text-[10px]">
                        v1.2.4-PROD
                    </Badge>
                </div>
            </div>

            <StatsGrid stats={stats} />

            <SectionHeader title="Entity management" icon={LayoutDashboard} />
            <ManagementTables />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <SectionHeader title="Recent Platform Activity" icon={Activity} />
                    <GlassCard className="p-12 flex flex-col items-center justify-center text-center border-dashed border-white/10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-gray-700" />
                        </div>
                        <p className="text-gray-500 font-medium">Audit logs will appear here as admins perform actions.</p>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <SectionHeader title="System Status" icon={Shield} />
                    <GlassCard className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Current Time</span>
                                <span className="font-mono text-white text-xs">{new Date().toISOString().split('T')[1].split('.')[0]} UTC</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Standard Ops Window</p>
                                <p className="text-sm text-white font-medium">08:00 - 20:00 UTC</p>
                                <div className="pt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span className="text-xs text-green-400 font-bold">Systems Online</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
