import React from 'react';
import { 
    Shield, 
    Sword, 
    Link as LinkIcon, 
    Users, 
    CheckCircle2, 
    Terminal,
    Trophy,
    Activity
} from 'lucide-react';
import { PrizeDistribution } from "./PrizeDistribution";
import { GlassCard, SectionHeader, NeonBadge } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface TournamentDetailsProps {
    eventDetails: any;
}

const TournamentDetails: React.FC<TournamentDetailsProps> = ({ eventDetails }) => {
    if (!eventDetails) return null;

    const organizer = eventDetails.orgId && typeof eventDetails.orgId === 'object' && !Array.isArray(eventDetails.orgId) 
        ? eventDetails.orgId 
        : null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Main Intel Column */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Tournament Description */}
                    <div className="group space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                                <Shield size={22} />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Tournament Description</h2>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Detailed information & Mission</p>
                            </div>
                        </div>

                        <GlassCard className="p-8 relative group/card hover:border-purple-500/30 transition-all duration-500">
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none" />
                            <div className="absolute top-4 right-4 text-purple-500/20 group-hover/card:text-purple-500/40 transition-colors">
                                <Terminal size={14} />
                            </div>
                            
                            <div className="relative z-10 text-gray-400 text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap">
                                {eventDetails.description || "The arena master has not provided a mission briefing. Use extreme caution upon entry."}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Map Rotation */}
                    {eventDetails.map && eventDetails.map.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <Sword size={22} />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Map Rotation</h2>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Active Battlegrounds</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {eventDetails.map.map((mapName: string, index: number) => (
                                    <GlassCard key={index} className="px-6 py-5 flex items-center justify-between border-white/5 hover:border-purple-500/30 transition-all group overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-purple-500/10 transition-colors">
                                                <span className="text-xs font-black text-white/20 group-hover:text-purple-400">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                            <span className="text-base font-black text-white tracking-widest uppercase truncate">{mapName}</span>
                                        </div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500/50 group-hover:bg-purple-500 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-all" />
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Prize Distribution Section */}
                    {eventDetails.prizeDistribution && eventDetails.prizeDistribution.length > 0 && (
                        <div className="space-y-6">
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                    <Trophy size={22} />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Prize Distribution</h2>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Rank-wise rewards distribution</p>
                                </div>
                            </div>
                            
                            <PrizeDistribution
                                prizes={eventDetails.prizeDistribution}
                                title=""
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Organizer Profile Card */}
                    <div className="space-y-6">
                        <SectionHeader 
                            title="Organizer" 
                            icon={Users} 
                            titleClassName="text-sm tracking-[0.2em]" 
                            iconClassName="w-5 h-5"
                        />
                        
                        <GlassCard className="p-6 border-white/10 shadow-2xl relative overflow-hidden group">
                            {/* Inner Gradient Bloom */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all duration-700" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-emerald-500/30 transition-colors shadow-xl">
                                            <img 
                                                src={organizer?.imageUrl || "https://api.dicebear.com/7.x/shapes/svg?seed=organic"} 
                                                className="h-full w-full object-cover"
                                                alt={organizer?.name || "Organizer"}
                                            />
                                        </div>
                                        {organizer?.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 p-1 bg-brand-black rounded-lg border border-white/10">
                                                <CheckCircle2 size={12} className="text-blue-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link 
                                            to={`/organizer/${organizer?._id || eventDetails.orgId}`}
                                            className="block group/link"
                                        >
                                            <h3 className="text-lg font-black text-white truncate group-hover/link:text-emerald-400 transition-colors uppercase tracking-tight">
                                                {organizer?.name || "Gaming Hub"}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            {organizer?.isVerified && (
                                                <NeonBadge variant="green" className="py-0.5 px-2 text-[8px]">Verified</NeonBadge>
                                            )}
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{organizer?.region || "Global"}</span>
                                        </div>
                                    </div>
                                </div>

                                {organizer?.description && (
                                    <p className="text-xs text-gray-400 leading-relaxed font-medium line-clamp-3">
                                        {organizer.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Events</p>
                                        <p className="text-sm font-black text-white">{organizer?.stats?.totalEvents ?? 0}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Joined</p>
                                        <p className="text-sm font-black text-white">
                                            {organizer?.createdAt ? new Date(organizer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recently'}
                                        </p>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black uppercase tracking-widest text-[9px] h-10 rounded-xl group/btn"
                                    onClick={() => organizer?.socialLinks?.website && window.open(organizer.socialLinks.website, '_blank')}
                                >
                                    View Profile 
                                    <LinkIcon size={12} className="ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                                </Button>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Meta Indicators */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity size={14} className="text-purple-500" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Metadata</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <GlassCard className="p-4 border-white/5 text-center flex flex-col items-center justify-center">
                                <Trophy size={16} className="mb-2 text-amber-500" />
                                <p className="text-[8px] font-bold text-white/30 uppercase">Prize Pool</p>
                                <p className="text-xs font-black text-white truncate max-w-full px-2">
                                    {eventDetails.prizePool ? `₹${eventDetails.prizePool.toLocaleString()}` : "TBA"}
                                </p>
                            </GlassCard>
                            <GlassCard className="p-4 border-white/5 text-center flex flex-col items-center justify-center">
                                <Terminal size={16} className="mb-2 text-blue-500" />
                                <p className="text-[8px] font-bold text-white/30 uppercase">Format</p>
                                <p className="text-xs font-black text-white truncate max-w-full px-2">
                                    {eventDetails.format || eventDetails.category || "Standard"}
                                </p>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Quick Meta Card - Floating Bottom on Mobile, Sidebar on Desktop */}
                    <GlassCard className="p-5 border-white/5 bg-gradient-to-br from-gray-900/60 to-brand-black/40">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity size={14} className="text-purple-500" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Metadata</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Status</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    eventDetails.registrationStatus === 'registration-open' ? 'text-emerald-400' : 
                                    eventDetails.registrationStatus === 'registration-closed' ? 'text-red-400' : 'text-amber-400'
                                }`}>
                                    {eventDetails.registrationStatus?.replace('-', ' ') || "Unknown"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Platform</span>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                    {eventDetails.platform || "Cross-Play"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Type</span>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                    {eventDetails.eventType === 'scrims' ? 'Scrims' : 'Tournament'}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetails;
