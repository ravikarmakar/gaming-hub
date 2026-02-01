import { useMemo } from "react";
import {
    Users,
    Trophy,
    Activity,
    Calendar,
    Target,
    Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEventStore } from "@/features/events/store/useEventStore";
import { useTournamentStore } from "@/features/organizer/store/useTournamentStore";

export const TournamentOverview = () => {
    const { eventDetails } = useEventStore();
    const { rounds } = useTournamentStore();

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
            prizePool: eventDetails.prizePool || 0
        };
    }, [eventDetails, rounds]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <h4 className="text-xl font-bold text-white">${stats.prizePool.toLocaleString()}</h4>
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
                            <span className="text-sm text-gray-400">Start Date</span>
                            <span className="text-sm font-bold text-white">
                                {new Date(eventDetails.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
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
                                <p className="text-lg font-black text-white">${prize.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
