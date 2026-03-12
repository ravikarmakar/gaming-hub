import { useMemo } from "react";
import {
    Users,
    Trophy,
    Activity,
    Calendar,
    Target,
    Zap,
    Gamepad2,
    Ticket,
    Map,
    Plus,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useGetRoundsQuery } from "../../hooks";
import { Event } from "@/features/events/lib/types";

interface TournamentOverviewProps {
    eventDetails?: Event;
}

export const TournamentOverview = ({ eventDetails }: TournamentOverviewProps) => {
    const navigate = useNavigate();
    const { data: rounds = [] } = useGetRoundsQuery(eventDetails?._id || "");

    const stats = useMemo(() => {
        if (!eventDetails) return null;

        const totalSlots = eventDetails.maxSlots || 0;
        const joinedSlots = eventDetails.joinedSlots || 0;
        const fillPercentage = totalSlots > 0 ? (joinedSlots / totalSlots) * 100 : 0;

        const completedRounds = rounds.filter(r => r.status === 'completed').length;
        const totalRounds = rounds.length;

        return {
            totalSlots,
            joinedSlots,
            fillPercentage,
            completedRounds,
            totalRounds,
            prizePool: eventDetails.prizePool || 0,
            maxInvitedSlots: eventDetails.maxInvitedSlots || 0,
            invitedCount: eventDetails.invitedTeams?.length || 0,
        };
    }, [eventDetails, rounds]);

    const activeRoadmap = useMemo(() => {
        if (!eventDetails) return [];
        return eventDetails.roadmaps?.find(r => r.type === 'tournament')?.data || eventDetails.roadmap || [];
    }, [eventDetails]);

    const activeInvitedRoadmap = useMemo(() => {
        if (!eventDetails) return [];
        return eventDetails.roadmaps?.find(r => r.type === 'invitedTeams')?.data || eventDetails.invitedTeamsRoadmap || [];
    }, [eventDetails]);

    if (!eventDetails || !stats) {
        return (
            <div className="p-8 text-center text-gray-500">
                Gathering tournament data...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Registrations</p>
                            <h4 className="text-xl font-bold text-white">{stats.joinedSlots} / {stats.totalSlots}</h4>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Trophy className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Prize Pool</p>
                            <h4 className="text-xl font-bold text-white">₹{formatCurrency(stats.prizePool)}</h4>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Progress</p>
                            <h4 className="text-xl font-bold text-white">{stats.completedRounds} / {stats.totalRounds} Rounds</h4>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</p>
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[10px]">
                                {eventDetails.eventProgress}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                            <Gamepad2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Type</p>
                            <h4 className="text-xl font-bold text-white capitalize">{eventDetails.eventType}</h4>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 rounded-xl">
                            <Ticket className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Entry Fee</p>
                            <h4 className="text-xl font-bold text-white">{eventDetails.isPaid ? `₹${formatCurrency(eventDetails.entryFee || 0)}` : 'Free'}</h4>
                        </div>
                    </CardContent>
                </Card>

                {(eventDetails.eventType === "tournament" || stats.maxInvitedSlots > 0) && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-fuchsia-500/10 rounded-xl">
                                <Users className="w-5 h-5 text-fuchsia-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Invited Teams</p>
                                <h4 className="text-xl font-bold text-white">{stats.invitedCount} / {stats.maxInvitedSlots || "∞"}</h4>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Participation Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        Slot Utilization
                    </h3>
                    <Card className="bg-black/20 border-white/5 p-6">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-black text-white">{stats.fillPercentage.toFixed(1)}%</p>
                                    <p className="text-sm text-gray-500">Tournament capacity reached</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-400">{stats.totalSlots - stats.joinedSlots} slots remaining</p>
                                </div>
                            </div>
                            <Progress value={stats.fillPercentage} className="h-2 bg-white/5" />
                        </div>
                    </Card>
                </div>

                {/* Event Schedule Summary */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Timeline Summary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-400">Event Start</span>
                            <span className="text-sm font-bold text-white">
                                {formatDate(eventDetails.startDate)}
                            </span>
                        </div>
                        {eventDetails.eventEndAt && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-sm text-gray-400">Event End</span>
                                <span className="text-sm font-bold text-white">
                                    {formatDate(eventDetails.eventEndAt)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-400">Registration Closes</span>
                            <span className="text-sm font-bold text-white">
                                {formatDate(eventDetails.registrationEndsAt)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-gray-400">Registration Status</span>
                            <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                                {eventDetails.registrationStatus.replace('-', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prize Distribution (if available) */}
            {eventDetails.prizeDistribution && eventDetails.prizeDistribution.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        Prize Distribution
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {eventDetails.prizeDistribution.map((prize, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-1">
                                    {prize.label || `Rank ${prize.rank}`}
                                </p>
                                <p className="text-lg font-black text-white">₹{formatCurrency(prize.amount)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Roadmap Section */}
            {(activeRoadmap.length > 0 || activeInvitedRoadmap.length > 0) && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Map className="w-4 h-4 text-purple-400" />
                        Event Roadmaps
                    </h3>

                    <Tabs defaultValue="main" className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <TabsList className="bg-white/5 border border-white/10 p-1">
                                <TabsTrigger value="main" className="text-[10px] font-black uppercase tracking-widest px-4 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                                    Main Roadmap
                                </TabsTrigger>
                                {activeInvitedRoadmap.length > 0 && (
                                    <TabsTrigger value="invited" className="text-[10px] font-black uppercase tracking-widest px-4 data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all">
                                        Invited Roadmap
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {activeInvitedRoadmap.length > 0 && (
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-black uppercase tracking-tighter h-7">
                                    Dual-Roadmap Active
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <TabsContent value="main" className="m-0 focus-visible:ring-0">
                                <Card className="bg-black/20 border-white/5 p-6 rounded-2xl">
                                    <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-purple-500/50 before:via-purple-500/10 before:to-transparent">
                                        {activeRoadmap.map((step, idx) => (
                                            <div key={idx} className="relative group">
                                                <div className={`absolute -left-[38px] w-6 h-6 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.isFinale ? 'bg-amber-500 text-brand-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : step.isLeague ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                    {step.isFinale ? <Trophy size={10} /> : step.isLeague ? <Users size={10} /> : <Activity size={10} />}
                                                </div>
                                                <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-5 transition-all duration-300">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{step.name}</p>
                                                            <h4 className="text-lg font-black text-white tracking-tight">{step.title}</h4>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {step.isLeague && (
                                                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 uppercase text-[9px] font-black">
                                                                    {step.leagueType?.replace("-", " ") || "League Mode"}
                                                                </Badge>
                                                            )}
                                                            {step.isFinale && (
                                                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[9px] font-black">
                                                                    {step.grandFinaleType?.replace("-", " ") || "Grand Finale"}
                                                                </Badge>
                                                            )}
                                                            {!step.isLeague && !step.isFinale && (
                                                                <Badge className="bg-white/5 text-gray-500 border-white/10 uppercase text-[9px] font-black">
                                                                    Standard
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {activeRoadmap.length === 0 && (
                                            <p className="text-gray-500 text-xs py-4 italic">No rounds defined in the main roadmap</p>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>

                            {activeInvitedRoadmap.length > 0 && (
                                <TabsContent value="invited" className="m-0 focus-visible:ring-0">
                                    <Card className="bg-black/20 border-white/5 p-6 rounded-2xl">
                                        <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-rose-500/50 before:via-rose-500/10 before:to-transparent">
                                            {activeInvitedRoadmap.map((step, idx) => (
                                                <div key={idx} className="relative group">
                                                    <div className={`absolute -left-[38px] w-6 h-6 rounded-lg border-4 border-brand-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.isFinale ? 'bg-amber-500 text-brand-black' : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}>
                                                        {step.isFinale ? <Trophy size={10} /> : <Users size={10} />}
                                                    </div>
                                                    <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-5 transition-all duration-300">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{step.name}</p>
                                                                <h4 className="text-lg font-black text-white tracking-tight">{step.title}</h4>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {/* Mapping Logic */}
                                                                {(() => {
                                                                    const mapping = eventDetails.invitedRoundMappings?.find(m => idx >= m.startRound && idx <= m.endRound);
                                                                    if (mapping) {
                                                                        const targetRound = activeRoadmap[mapping.targetMainRound];
                                                                        return (
                                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[9px] font-black flex items-center gap-1">
                                                                                Merges to: {targetRound?.name || `Round ${mapping.targetMainRound + 1}`}
                                                                                <ArrowRight size={8} />
                                                                            </Badge>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                                {step.isLeague && (
                                                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase text-[9px] font-black">
                                                                        {step.leagueType?.replace("-", " ")}
                                                                    </Badge>
                                                                )}
                                                                {step.isFinale && (
                                                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[9px] font-black">
                                                                        {step.grandFinaleType?.replace("-", " ")}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </div>
            )}

            {/* Empty State for Invited Roadmap if applicable */}
            {eventDetails.eventType === "invited-tournament" && activeInvitedRoadmap.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                    <Map className="w-8 h-8 text-gray-500 mb-3" />
                    <h4 className="text-white font-bold mb-1">No Invited Roadmap</h4>
                    <p className="text-sm text-gray-400 mb-4 max-w-sm">This tournament has invited teams enabled. Create a roadmap to manage their progression.</p>
                    <Button
                        className="bg-rose-500 text-white hover:bg-rose-600 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all font-bold tracking-widest uppercase text-xs px-6 py-4 h-auto"
                        onClick={() => navigate(ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", eventDetails._id))}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Invited Roadmap
                    </Button>
                </div>
            )}
        </div>
    );
};
