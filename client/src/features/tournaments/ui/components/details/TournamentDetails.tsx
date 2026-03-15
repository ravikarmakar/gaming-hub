import React from 'react';
import { Shield, Sword } from 'lucide-react';
import { PrizeDistribution } from "./PrizeDistribution";
import { GlassCard, SectionHeader } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { formatCurrency } from "@/lib/utils";

interface TournamentDetailsProps {
    eventDetails: any;
}

const TournamentDetails: React.FC<TournamentDetailsProps> = ({ eventDetails }) => {
    if (!eventDetails) return null;

    return (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Essentials Meta Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl">
                <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Starts On</p>
                    <p className="text-xs font-bold text-white/90">
                        {(() => {
                            if (!eventDetails.startDate) return "TBD";
                            const date = new Date(eventDetails.startDate);
                            return isNaN(date.getTime())
                                ? "TBD"
                                : date.toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                        })()}
                    </p>
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Total Slots</p>
                    <p className="text-xs font-bold text-white/90">{eventDetails.maxSlots} Teams</p>
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Access</p>
                    <p className="text-xs font-bold text-white/90">
                        {eventDetails.registrationMode === 'invite-only' ? 'Invite Only' : 'Open'}
                    </p>
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Format</p>
                    <p className="text-xs font-bold text-white/90 uppercase">{eventDetails.category || 'Squad'}</p>
                </div>
                <div className="space-y-1.5 pl-3 border-l border-white/5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Bounty</p>
                    <p className="text-xs font-bold text-amber-400">
                        ₹{formatCurrency(eventDetails.prizePool)}
                    </p>
                </div>
                <div className="space-y-1.5 pl-3 border-l border-white/5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Entry</p>
                    <p className="text-xs font-bold text-emerald-400">
                        {eventDetails.isPaid ? `₹${formatCurrency(eventDetails.entryFee)}` : 'FREE'}
                    </p>
                </div>
            </div>

            {/* Briefing */}
            <div className="space-y-4 sm:space-y-6">
                <SectionHeader title="Tactical Briefing" icon={Shield} />
                <div className="text-gray-400 text-sm sm:text-base leading-relaxed font-medium bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                    {eventDetails.description || "The arena master has not provided a mission briefing. Use extreme caution upon entry."}
                </div>
            </div>

            {/* Map Rotation */}
            {eventDetails.map && eventDetails.map.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                    <SectionHeader title="Map Rotation" icon={Sword} />
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        {eventDetails.map.map((mapName: string, index: number) => (
                            <GlassCard key={index} className="px-6 py-4 flex items-center gap-3 border-purple-500/10 hover:border-purple-500/30 transition-all group">
                                <div className="h-2 w-2 rounded-full bg-purple-500/50 group-hover:bg-purple-500 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all" />
                                <span className="text-sm sm:text-lg font-black text-white tracking-widest uppercase">{mapName}</span>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Rank Rewards Section */}
            {eventDetails.prizeDistribution && eventDetails.prizeDistribution.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                    <PrizeDistribution
                        prizes={eventDetails.prizeDistribution}
                        title="Rewards Distribution"
                    />
                </div>
            )}
        </div>
    );
};

export default TournamentDetails;
