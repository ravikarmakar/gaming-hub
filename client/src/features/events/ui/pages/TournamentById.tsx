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
    MessageSquare,
    ListOrdered,
    Gavel,
    Info,
} from "lucide-react";

import { useEventStore } from "@/features/events/store/useEventStore";
import {
    GlassCard,
    NeonBadge,
    SectionHeader
} from "@/features/events/ui/components/ThemedComponents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import TeamList from "../components/TeamList";
import { useTournamentStore } from "@/features/organizer/store/useTournamentStore";
import FinalLeaderboard from "../components/FinalLeaderboard";

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

    // Final Results State
    const {
        rounds,
        fetchRounds,
        fetchGroups,
        groups,
        fetchLeaderboard,
        leaderboard,
    } = useTournamentStore();

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

    // Fetch Final Results if event is completed
    useEffect(() => {
        if (eventDetails?.eventProgress === 'completed' && id) {
            fetchRounds(id);
        }
    }, [eventDetails?.eventProgress, id, fetchRounds]);

    useEffect(() => {
        if (eventDetails?.eventProgress === 'completed' && rounds.length > 0) {
            const lastRound = rounds[rounds.length - 1];
            if (lastRound) {
                fetchGroups(lastRound._id);
            }
        }
    }, [eventDetails?.eventProgress, rounds]);

    useEffect(() => {
        if (eventDetails?.eventProgress === 'completed' && groups.length > 0) {
            const grandFinaleGroup = groups[0];
            fetchLeaderboard(grandFinaleGroup._id);
        }
    }, [eventDetails?.eventProgress, groups]);

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
                        Back
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

                        {/* Immersive Hero Banner */}
                        <div className="relative group px-1 sm:px-0">
                            <GlassCard className="aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] p-0 relative overflow-hidden border-white/10 rounded-2xl sm:rounded-[2rem] shadow-2xl">
                                <img
                                    src={eventDetails.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms] opacity-80"
                                    alt={eventDetails.title}
                                />
                                {/* Dynamic Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#06070D] via-transparent to-transparent opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#06070D]/60 via-transparent to-transparent opacity-40" />

                                {/* Status Chip on Banner */}
                                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex gap-2 sm:gap-3">
                                    <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-1.5 sm:gap-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.2em]">Operational</span>
                                    </div>
                                    <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-purple-600/30 backdrop-blur-xl border border-purple-500/20 text-purple-200">
                                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">{eventDetails.eventType}</span>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Decorative Elements - Hidden on mobile for performance */}
                            <div className="hidden sm:block absolute -bottom-6 -right-6 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-colors" />
                            <div className="hidden sm:block absolute -top-6 -left-6 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-colors" />
                        </div>

                        {/* Refined Dossier Header */}
                        <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-6 sm:w-8 bg-purple-500/50" />
                                    <span className="text-[8px] sm:text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] sm:tracking-[0.4em]">{eventDetails.game} Terminal</span>
                                </div>
                                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tightest leading-[1] sm:leading-[0.9] drop-shadow-2xl">
                                    {eventDetails.title}
                                </h1>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <NeonBadge variant="green" className="py-2 px-4 sm:px-6 rounded-xl border-emerald-500/20 bg-emerald-500/5 w-fit">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                        <span className="text-[10px] sm:text-xs tracking-widest uppercase font-bold">{eventDetails.registrationStatus.replace('-', ' ')}</span>
                                    </div>
                                </NeonBadge>

                                <div className="flex items-center gap-8 sm:gap-12 sm:ml-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                                            <TrendingUp size={18} className="sm:hidden" />
                                            <TrendingUp size={24} className="hidden sm:block" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Rewards</p>
                                            <p className="text-lg sm:text-2xl font-black text-white tracking-tight">${eventDetails.prizePool?.toLocaleString() || "0"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                                            <Users size={18} className="sm:hidden" />
                                            <Users size={24} className="hidden sm:block" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Density</p>
                                            <p className="text-lg sm:text-2xl font-black text-white tracking-tight">{eventDetails.joinedSlots || 0} <span className="text-white/20">/ {eventDetails.maxSlots}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabbed Intelligence & Engagement Module */}
                        <div className="pt-4 sm:pt-8 overflow-hidden">
                            <Tabs defaultValue="intel" className="space-y-6 sm:space-y-8">
                                <div className="relative">
                                    {/* Horizontal Scroll Gradient Fades */}
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#06070D] to-transparent z-10 pointer-events-none opacity-0 sm:hidden" />
                                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#06070D] to-transparent z-10 pointer-events-none sm:hidden" />

                                    <TabsList className="bg-white/5 border border-white/10 p-1 h-auto rounded-xl sm:rounded-2xl flex flex-nowrap overflow-x-auto scrollbar-hide justify-start w-full">
                                        <TabsTrigger
                                            value="intel"
                                            className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap flex-shrink-0"
                                        >
                                            <Info size={12} className="mr-1.5 sm:mr-2" />
                                            Intel
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="units"
                                            className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap flex-shrink-0"
                                        >
                                            <Users size={12} className="mr-1.5 sm:mr-2" />
                                            Units
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="results"
                                            disabled={eventDetails.eventProgress !== 'completed'}
                                            className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap flex-shrink-0 disabled:opacity-30"
                                        >
                                            <Trophy size={12} className="mr-1.5 sm:mr-2" />
                                            Results
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="rules"
                                            className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap flex-shrink-0"
                                        >
                                            <Gavel size={12} className="mr-1.5 sm:mr-2" />
                                            Rules
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="points"
                                            className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap flex-shrink-0"
                                        >
                                            <ListOrdered size={12} className="mr-1.5 sm:mr-2" />
                                            Points
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="chat"
                                            className="rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap flex-shrink-0"
                                        >
                                            <MessageSquare size={12} className="mr-1.5 sm:mr-2" />
                                            Chat
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="intel" className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {/* Briefing */}
                                    <div className="space-y-4 sm:space-y-6">
                                        <SectionHeader title="Tactical Briefing" icon={Shield} />
                                        <div className="text-gray-400 text-sm sm:text-lg leading-relaxed font-medium bg-white/[0.02] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5">
                                            {eventDetails.description || "The arena master has not provided a mission briefing. Use extreme caution upon entry."}
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    {eventDetails.prizeDistribution && eventDetails.prizeDistribution.length > 0 && (
                                        <div className="space-y-4 sm:space-y-6">
                                            <SectionHeader title="Rank Rewards" icon={Trophy} />
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                                                {eventDetails.prizeDistribution.map((prize, index) => (
                                                    <GlassCard key={index} className="p-4 sm:p-6 relative group border-purple-500/5 hover:border-purple-500/20 transition-all overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <Trophy size={32} className="text-amber-500 sm:hidden" />
                                                            <Trophy size={48} className="text-amber-500 hidden sm:block" />
                                                        </div>
                                                        <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rank {prize.rank}</p>
                                                        <p className="text-lg sm:text-2xl font-black text-white tracking-tight">${prize.amount.toLocaleString()}</p>
                                                        {prize.label && <p className="mt-1 text-[8px] sm:text-xs font-bold text-purple-400 uppercase tracking-widest truncate">{prize.label}</p>}
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="units" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-6">
                                        <SectionHeader title="Formation Intel" icon={Users} />
                                        <TeamList eventId={eventDetails._id} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="results" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {leaderboard ? (
                                        <FinalLeaderboard leaderboard={leaderboard} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-2">
                                                <Trophy size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Awaiting Finalization</h3>
                                            <p className="text-gray-500 max-w-sm text-sm">Tournament results are being verified by the Arena Master. Final standings will be broadcasted shortly.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="rules" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <Gavel size={48} className="text-gray-600 mb-2" />
                                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Standard Protocol</h3>
                                        <p className="text-gray-500 max-w-sm text-sm">The official ruleset for this tournament is currently being encrypted. Please refer to general platform guidelines in the meantime.</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="points" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <ListOrdered size={48} className="text-gray-600 mb-2" />
                                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Points Encryption</h3>
                                        <p className="text-gray-500 max-w-sm text-sm">Detailed point distribution mechanics for each round will be displayed here once the tournament commences.</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="chat" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <MessageSquare size={48} className="text-gray-600 mb-2" />
                                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Secure Comm-Link</h3>
                                        <p className="text-gray-500 max-w-sm text-sm">End-to-end encrypted communication channel between combat units and command center will be established pre-match.</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Engagement Module */}
                    <div className="space-y-6 sm:space-y-8 h-fit lg:sticky lg:top-32 order-last lg:order-none">
                        <GlassCard className="p-6 sm:p-8 border-purple-500/20 shadow-2xl relative overflow-hidden group">
                            {/* Animated Background Pulse for the card */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors duration-1000" />

                            <div className="space-y-6 sm:space-y-8 relative z-10">
                                <div className="text-center pb-6 border-b border-white/5">
                                    <p className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 font-orbitron">Arena Entry Token</p>
                                    <p className="text-3xl sm:text-4xl font-black text-white tracking-[0.2em] font-orbitron drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">#{eventDetails._id.slice(-6).toUpperCase()}</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover/item:bg-purple-500/20 transition-all duration-300">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Commencement</p>
                                            <p className="text-sm sm:text-base font-bold text-white">{new Date(eventDetails.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group/item">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover/item:bg-blue-500/20 transition-all duration-300">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Formation Limit</p>
                                            <p className="text-sm sm:text-base font-bold text-white">{eventDetails.maxSlots} Combat Units</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group/item">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-500/20 transition-all duration-300">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Deployment</p>
                                            <p className="text-sm sm:text-base font-bold text-white">Public Arena</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    {regStatus === "approved" ? (
                                        <div className="w-full py-4 sm:py-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                            <Sword size={18} /> REGISTERED SUCCESSFULLY
                                        </div>
                                    ) : regStatus === "pending" ? (
                                        <div className="w-full py-4 sm:py-5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 animate-pulse">
                                            <Shield size={18} /> REGISTRATION PENDING
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleRegister}
                                            disabled={eventDetails.eventProgress === "completed"}
                                            className="w-full relative py-4 sm:py-5 bg-purple-600 hover:bg-purple-510 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl sm:rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] group/btn overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2 tracking-[0.1em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm">
                                                {eventDetails.eventProgress === "completed" ? "Arena Closed" :
                                                    eventDetails.registrationMode === "invite-only" ? "Request Deployment" : "Register Personnel"}
                                                <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                                            </span>
                                            <div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform"
                                                style={{ transitionDuration: "1000ms" }}
                                            />
                                        </button>
                                    )}
                                </div>

                                <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-widest leading-relaxed">
                                    * Protocol adherence is mandatory for all combatants.
                                </p>
                            </div>
                        </GlassCard>

                        <div className="hidden lg:block">
                            <GlassCard className="p-6 flex items-center gap-4 bg-white/[0.02]">
                                <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                                    <Trophy size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Escrow Status</p>
                                    <p className="text-sm font-black text-white">Pool Verified & Locked</p>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentById;
