import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Trophy,
    Calendar,
    Users,
    Sword,
    Shield,
    Share2,
    Heart,
    ArrowLeft,
    ChevronRight,
    TrendingUp,
    MapPin,
} from "lucide-react";

import { useEventStore } from "@/features/events/store/useEventStore";
import {
    GlassCard,
    NeonBadge,
    SectionHeader
} from "@/features/events/ui/components/ThemedComponents";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import TeamList from "../components/TeamList";

const TournamentById = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        eventDetails,
        fetchEventDetailsById,
        isLoading,
        registerEvent,
        isTeamRegistered
    } = useEventStore();

    const [regStatus, setRegStatus] = useState<"approved" | "pending" | "none">("none");
    const [isTeamListOpen, setIsTeamListOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEventDetailsById(id);
        }
    }, [id, fetchEventDetailsById]);

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            if (eventDetails && user?.teamId) {
                const result = await isTeamRegistered(eventDetails._id, user.teamId);
                setRegStatus(result.status);
            }
        };
        checkRegistrationStatus();
    }, [eventDetails, user, isTeamRegistered]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#06070D]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Arena Protocol...</p>
                </div>
            </div>
        );
    }

    if (!eventDetails) return (
        <div className="flex items-center justify-center min-h-screen bg-[#06070D] text-gray-400">
            Mission intel not found.
        </div>
    );

    const handleRegister = async () => {
        if (id) {
            const result = await registerEvent(id);
            if (result?.success) {
                toast.success(result.message || "Successfully deployed to arena!");
                // Refresh status
                const statusResult = await isTeamRegistered(id, user?.teamId || "");
                setRegStatus(statusResult.status);
            } else {
                toast.error(result?.message || "Deployment failed. Request backup.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#06070D] text-white relative overflow-hidden pb-12 pt-24">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[180px] -mr-96 -mt-96 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[180px] -ml-96 -mb-96 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation / Actions Bar */}
                <div className="mb-12 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-sm font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Abort & Return
                    </button>

                    <div className="flex gap-4">
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:bg-white/10">
                            <Share2 size={18} />
                        </button>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-rose-500 transition-all hover:bg-rose-500/10 hover:border-rose-500/30">
                            <Heart size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Dossier Section */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Immersive Header */}
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <NeonBadge variant="purple">{eventDetails.game}</NeonBadge>
                                <NeonBadge variant="blue">{eventDetails.eventType}</NeonBadge>
                                <NeonBadge variant="green" className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {eventDetails.status.replace('-', ' ')}
                                </NeonBadge>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-sm">
                                {eventDetails.title}
                            </h1>

                            <div className="flex flex-wrap gap-8 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <TrendingUp className="text-emerald-400 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Prize Pool</p>
                                        <p className="text-xl font-black text-white tracking-tight">${eventDetails.prizePool?.toLocaleString() || "0"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Users className="text-blue-400 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Participants</p>
                                        <p className="text-xl font-black text-white tracking-tight">{eventDetails.joinedSlots || 0} / {eventDetails.maxSlots}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Hero Cinematic */}
                        <GlassCard className="aspect-video p-0 relative group overflow-hidden border-purple-500/10">
                            <img
                                src={eventDetails.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                                alt=""
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1A] via-transparent to-transparent opacity-90" />
                        </GlassCard>

                        {/* Tactical Briefing */}
                        <div className="space-y-6">
                            <SectionHeader title="Tactical Briefing" icon={Shield} />
                            <div className="text-gray-400 text-lg leading-relaxed font-medium">
                                {eventDetails.description || "The arena master has not provided a mission briefing. Use extreme caution upon entry."}
                            </div>
                        </div>

                        {/* Reward Grid */}
                        {eventDetails.prizeDistribution && eventDetails.prizeDistribution.length > 0 && (
                            <div className="space-y-6">
                                <SectionHeader title="Rank Rewards" icon={Trophy} />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {eventDetails.prizeDistribution.map((prize, index) => (
                                        <GlassCard key={index} className="p-6 relative group border-purple-500/5 hover:border-purple-500/20 transition-all">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Trophy size={48} className="text-amber-500" />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rank {prize.rank}</p>
                                            <p className="text-2xl font-black text-white tracking-tight">${prize.amount.toLocaleString()}</p>
                                            {prize.label && <p className="mt-1 text-xs font-bold text-purple-400 uppercase tracking-widest">{prize.label}</p>}
                                        </GlassCard>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Team List Section */}
                        <div className="pt-8 border-t border-white/5">
                            {!isTeamListOpen ? (
                                <button
                                    onClick={() => setIsTeamListOpen(true)}
                                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    View Deployed Units
                                </button>
                            ) : (
                                <TeamList eventId={eventDetails._id} setIsOpen={setIsTeamListOpen} />
                            )}
                        </div>
                    </div>

                    {/* Engagement Module */}
                    <div className="space-y-8">
                        <GlassCard className="p-8 border-purple-500/20 shadow-2xl">
                            <div className="space-y-8">
                                <div className="text-center pb-6 border-b border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Arena Entry Code</p>
                                    <p className="text-4xl font-black text-white tracking-widest">#{eventDetails._id.slice(-6).toUpperCase()}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Commencement</p>
                                            <p className="text-sm font-black text-white">{new Date(eventDetails.startDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Formation Limit</p>
                                            <p className="text-sm font-black text-white">{eventDetails.maxSlots} Combat Units</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deployment Point</p>
                                            <p className="text-sm font-black text-white">Global Cloud Access</p>
                                        </div>
                                    </div>
                                </div>

                                {regStatus === "approved" ? (
                                    <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black rounded-2xl flex items-center justify-center gap-2">
                                        <Sword size={18} /> DEPLOYED TO ARENA
                                    </div>
                                ) : regStatus === "pending" ? (
                                    <div className="w-full py-5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black rounded-2xl flex items-center justify-center gap-2 animate-pulse">
                                        <Shield size={18} /> DEPLOYMENT PENDING
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRegister}
                                        disabled={eventDetails.status === "completed"}
                                        className="w-full relative py-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-glow hover:shadow-glow-lg group overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest uppercase">
                                            {eventDetails.status === "completed" ? "Arena Closed" :
                                                eventDetails.registrationMode === "invite-only" ? "Request Deployment" : "Register Personnel"}
                                            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                                        </span>
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform"
                                            style={{ transitionDuration: "1500ms" }}
                                        />
                                    </button>
                                )}

                                <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest">
                                    * By joining, you agree to official tournament engagement rules.
                                </p>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-amber-400">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Prize Status</p>
                                    <p className="text-lg font-black text-white">Verified Pool</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentById;
