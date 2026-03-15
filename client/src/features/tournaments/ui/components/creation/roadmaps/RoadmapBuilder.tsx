import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Map as MapIcon, Users, Zap, Trophy, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { TournamentFormValues } from "@/features/tournaments/lib";
import { RoadmapSection } from "../RoadmapSection";
import { InvitedTeamsRoadmapSection } from "@/features/tournaments/ui/components/creation/InvitedTeamsRoadmapSection";
import { T1SpecialRoadmapSection } from "@/features/tournaments/ui/components/creation/T1SpecialRoadmapSection";

export const RoadmapBuilder = () => {
    const { watch, setValue } = useFormContext<TournamentFormValues>();
    const [activeTab, setActiveTab] = useState<"standard" | "invited" | "special">("standard");

    const eventType = watch("eventType");
    const hasStandardRoadmap = watch("hasRoadmap") ?? (eventType === "tournament");
    const hasInvitedRoadmap = watch("hasInvitedTeams");
    const hasSpecialRoadmap = watch("hasT1SpecialRoadmap");

    const tabs = [
        {
            id: "standard",
            label: "Main Roadmap",
            icon: MapIcon,
            enabled: hasStandardRoadmap,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            id: "invited",
            label: "Invited Teams",
            icon: Users,
            enabled: hasInvitedRoadmap,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            id: "special",
            label: "T1 Special",
            icon: Zap,
            enabled: hasSpecialRoadmap,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        }
    ] as const;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar: Controls & Tabs */}
            <div className="lg:col-span-1 space-y-4">
                <GlassCard className="p-4 space-y-6">
                    <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 pl-1">Configuration</h4>
                        <div className="space-y-3">
                            {/* Standard Tournament Toggle (Only if applicable) */}
                            {eventType === "tournament" && (
                                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                    <Label htmlFor="toggle-standard" className="text-[10px] font-bold text-gray-400 uppercase cursor-pointer">Main Roadmap</Label>
                                    <Checkbox
                                        id="toggle-standard"
                                        checked={hasStandardRoadmap}
                                        onCheckedChange={(checked) => setValue("hasRoadmap", !!checked)}
                                        className="data-[state=checked]:bg-purple-500 border-white/20"
                                    />
                                </div>
                            )}

                            {/* Invited Teams Toggle */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                <Label htmlFor="toggle-invited" className="text-[10px] font-bold text-gray-400 uppercase cursor-pointer">Invited Teams</Label>
                                <Checkbox
                                    id="toggle-invited"
                                    checked={hasInvitedRoadmap}
                                    onCheckedChange={(checked) => setValue("hasInvitedTeams", !!checked)}
                                    className="data-[state=checked]:bg-indigo-500 border-white/20"
                                />
                            </div>

                            {/* T1 Special Toggle */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                <Label htmlFor="toggle-special" className="text-[10px] font-bold text-gray-400 uppercase cursor-pointer">T1 Special</Label>
                                <Checkbox
                                    id="toggle-special"
                                    checked={hasSpecialRoadmap}
                                    onCheckedChange={(checked) => setValue("hasT1SpecialRoadmap", !!checked)}
                                    className="data-[state=checked]:bg-amber-500 border-white/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 pl-1">Navigation</h4>
                        <div className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                const isDisabled = !tab.enabled;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-xl transition-all group relative overflow-hidden",
                                            isActive
                                                ? cn("bg-white/10 border border-white/10", tab.color)
                                                : isDisabled
                                                    ? "opacity-30 cursor-not-allowed filter grayscale"
                                                    : "hover:bg-white/5 text-gray-500 hover:text-gray-300 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={cn(
                                                "p-1.5 rounded-lg transition-colors",
                                                isActive ? tab.bg : "bg-white/5"
                                            )}>
                                                <Icon size={14} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                                        </div>
                                        {isActive && <ChevronRight size={12} className="relative z-10" />}
                                        {isActive && (
                                            <div className={cn("absolute inset-0 opacity-10", tab.bg)} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <div className="flex gap-3 text-amber-500/50">
                        <Trophy size={14} className="flex-shrink-0 mt-0.5" />
                        <p className="text-[9px] font-medium leading-relaxed uppercase tracking-wider">
                            Configure separate roadmaps for different tournament stages or invitation types.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Content Workspace */}
            <div className="lg:col-span-3">
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    {activeTab === "standard" && (
                        hasStandardRoadmap ? <RoadmapSection isEmbedded /> : <EmptyState label="Main Roadmap" />
                    )}
                    {activeTab === "invited" && (
                        hasInvitedRoadmap ? <InvitedTeamsRoadmapSection isEmbedded /> : <EmptyState label="Invited Teams" />
                    )}
                    {activeTab === "special" && (
                        hasSpecialRoadmap ? <T1SpecialRoadmapSection isEmbedded /> : <EmptyState label="T1 Special" />
                    )}
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ label }: { label: string }) => (
    <GlassCard className="p-12 border-dashed flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-600">
            <MapIcon size={32} />
        </div>
        <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{label} is Disabled</h4>
            <p className="text-[10px] text-gray-500 font-medium max-w-[200px] mt-2">
                Enable this roadmap in the configuration column to start building stages.
            </p>
        </div>
    </GlassCard>
);
