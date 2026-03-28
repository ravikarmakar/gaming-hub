import { useMemo } from "react";
import { Target, Calendar, } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { formatDate } from "@/lib/utils";
import { Roadmaps } from "../details/Roadmaps";
import { TournamentQuickStats } from "../shared/TournamentQuickStats";
import { PrizeDistribution } from "../details/PrizeDistribution";
import { useTournamentDashboard } from "@/features/tournaments/context/TournamentDashboardContext";

/**
 * TournamentOverview provides a high-level summary of the tournament's progress, 
 * slots, and schedule.
 * Consumes TournamentDashboardContext for eventDetails.
 */
export const TournamentOverview = () => {
    const { eventDetails } = useTournamentDashboard();

    const stats = useMemo(() => {
        if (!eventDetails) return null;

        const totalSlots = eventDetails.maxSlots || 0;
        const joinedSlots = eventDetails.joinedSlots || 0;
        const fillPercentage = totalSlots > 0 ? (joinedSlots / totalSlots) * 100 : 0;

        // Calculate round progress from internal roadmap data
        const tournamentRoadmap = eventDetails.roadmaps?.find(r => r.type === 'tournament');
        const roadmapData = Array.isArray(tournamentRoadmap?.data) ? tournamentRoadmap.data : [];

        const completedRounds = roadmapData.filter(item => item.status === 'completed').length;
        const totalRounds = roadmapData.length;

        return {
            totalSlots,
            joinedSlots,
            fillPercentage,
            completedRounds,
            totalRounds,
            prizePool: eventDetails.prizePool || 0,
            maxInvitedSlots: eventDetails.maxInvitedSlots || 0,
            invitedCount: eventDetails.invitedTeams?.length || 0,
            t1SpecialCount: eventDetails.t1SpecialTeams?.length || 0,
        };
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
            {/* Reusable Quick Stats (Enhanced with Additional Metrics) */}
            <TournamentQuickStats
                prizePool={eventDetails.prizePool || 0}
                joinedSlots={eventDetails.joinedSlots}
                maxSlots={eventDetails.maxSlots}
                regStatus="none" // Not relevant for organizer view
                eventProgress={eventDetails.eventProgress}
                registrationMode={eventDetails.registrationMode}
                format={eventDetails.category || "Squad"}
                startDate={eventDetails.startDate}
                entryFee={eventDetails.entryFee || 0}
                isPaid={eventDetails.isPaid || false}
                category={eventDetails.category || "Squad"}
                showRegisterButton={false}
                showAdditionalStats={true}
                completedRounds={stats.completedRounds}
                totalRounds={stats.totalRounds}
                invitedCount={stats.invitedCount}
                maxInvitedSlots={stats.maxInvitedSlots}
                t1SpecialCount={stats.t1SpecialCount}
                eventType={eventDetails.eventType}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Participation Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        Slot Progress
                    </h3>
                    <div className="bg-transparent p-6 px-0">
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
                            <Progress
                                value={stats.fillPercentage}
                                className="h-2 bg-purple-900/30 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-violet-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Event Schedule Summary */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Timeline Summary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 px-0 rounded-xl bg-transparent">
                            <span className="text-sm text-gray-400">Event Start</span>
                            <span className="text-sm font-bold text-white">
                                {formatDate(eventDetails.startDate)}
                            </span>
                        </div>
                        {eventDetails.eventEndAt && (
                            <div className="flex items-center justify-between p-3 px-0 rounded-xl bg-transparent">
                                <span className="text-sm text-gray-400">Event End</span>
                                <span className="text-sm font-bold text-white">
                                    {formatDate(eventDetails.eventEndAt)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between p-3 px-0 rounded-xl bg-transparent">
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

            {/* Prize Distribution Section */}
            {eventDetails.prizeDistribution && eventDetails.prizeDistribution.length > 0 && (
                <PrizeDistribution
                    prizes={eventDetails.prizeDistribution}
                    title="Rewards Distribution"
                    height={300}
                />
            )}

            {/* Shared Roadmap Tab Component */}
            {eventDetails.eventType !== 'scrims' && (
                <Roadmaps eventDetails={eventDetails} showCTA={true} useEventDataOnly={true} />
            )}
        </div>
    );
};
