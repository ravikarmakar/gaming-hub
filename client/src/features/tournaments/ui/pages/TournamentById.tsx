import { useNavigate, useParams } from "react-router-dom";
import { Trophy, Users, MessageSquare, ListOrdered, Gavel, Info, Map } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { 
    TournamentHeader, 
    TournamentQuickStats,
    Roadmaps,
    TournamentDetails
} from "@/features/tournaments/ui/components";
import {
    useGetTournamentDetailsQuery,
    useGetRegistrationStatusQuery,
    useRegisterTournamentMutation,
    useGetRoundsQuery,
    useGetGroupsQuery,
    useGetLeaderboardQuery
} from "@/features/tournaments/hooks";

// Extracted Tab Components
import { TeamsTab } from "@/features/tournaments/ui/components/details/TeamsTab";
import { ResultsTab } from "@/features/tournaments/ui/components/details/ResultsTab";
import { RulesTab } from "@/features/tournaments/ui/components/details/RulesTab";
import { PointsTab } from "@/features/tournaments/ui/components/details/PointsTab";
import { ChatTab } from "@/features/tournaments/ui/components/details/ChatTab";
import { useState } from "react";


const TABS_CONFIG = [
    { value: 'details', label: 'Details', icon: Info, color: 'purple', Component: TournamentDetails },
    { value: 'roadmap', label: 'Roadmap', icon: Map, color: 'indigo', Component: Roadmaps },
    { value: 'rules', label: 'Rules', icon: Gavel, color: 'zinc', Component: RulesTab },
    { value: 'points', label: 'Points', icon: ListOrdered, color: 'zinc', Component: PointsTab },
    { value: 'teams', label: 'Teams', icon: Users, color: 'blue', Component: TeamsTab },
    { value: 'chat', label: 'Chat', icon: MessageSquare, color: 'indigo', Component: ChatTab },
    { value: 'results', label: 'Results', icon: Trophy, color: 'amber', Component: ResultsTab },
];

const TournamentById = () => {
    const { id = "" } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("details");

    const { data: eventDetails, isLoading } = useGetTournamentDetailsQuery(id);

    const teamIdStr = typeof user?.teamId === 'string' ? user.teamId : user?.teamId?._id;
    const { data: regData } = useGetRegistrationStatusQuery(id, teamIdStr || "");
    const { mutateAsync: registerTournament } = useRegisterTournamentMutation();

    const regStatus = regData?.status || "none";

    // Optimized: Only fetch results/leaderboard data if the results tab is active or tournament is completed
    const isCompleted = eventDetails?.eventProgress === 'completed';
    const shouldFetchResults = activeTab === 'results' || isCompleted;

    const { data: rounds = [] } = useGetRoundsQuery(id);
    const lastRound = rounds[rounds.length - 1];

    const { data: groupsData } = useGetGroupsQuery(lastRound?._id || "", 1, 1, "", "", "", {
        enabled: !!lastRound?._id && shouldFetchResults
    });
    const grandFinaleGroup = groupsData?.groups?.[0];

    const { data: leaderboard } = useGetLeaderboardQuery(grandFinaleGroup?._id || "", {
        enabled: !!grandFinaleGroup?._id && shouldFetchResults
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-black">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Arena Protocol...</p>
                </div>
            </div>
        );
    }

    if (!eventDetails) return (
        <div className="flex items-center justify-center min-h-screen bg-brand-black text-gray-400">
            Tournament details not found.
        </div>
    );

    const handleRegister = async () => {
        try {
            await registerTournament(id);
        } catch (error: any) {
            console.error("Registration failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-12 pt-20">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[180px] -mr-96 -mt-96 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[180px] -ml-96 -mb-96 pointer-events-none" />

            {/* Immersive Full-Width Hero Banner */}
            <TournamentHeader eventDetails={eventDetails} navigate={navigate} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-2">
                    {/* Tournament Quick Stats Component */}
                    <TournamentQuickStats
                        prizePool={eventDetails.prizePool || 0}
                        joinedSlots={eventDetails.joinedSlots}
                        maxSlots={eventDetails.maxSlots}
                        regStatus={regStatus}
                        eventProgress={eventDetails.eventProgress}
                        registrationMode={eventDetails.registrationMode}
                        format={eventDetails.category || "Squad"}
                        startDate={eventDetails.startDate}
                        entryFee={eventDetails.entryFee || 0}
                        isPaid={eventDetails.isPaid || false}
                        category={eventDetails.category || "Squad"}
                        onRegister={handleRegister}
                    />

                    {/* Tabbed Intelligence & Engagement Module */}
                    <div className="pt-4 sm:pt-8 mt-4 sm:mt-8 overflow-hidden">
                        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
                            <div className="relative group/tabs">
                                {/* Horizontal Scroll Gradient Fades - Enhanced Visibility on Mobile */}
                                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none opacity-100 sm:opacity-0 group-focus-within/tabs:opacity-0 transition-opacity" />
                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none opacity-100 sm:opacity-0 transition-opacity" />

                                <TabsList className="bg-transparent border-b border-white/10 p-0 h-auto rounded-none flex flex-nowrap overflow-x-auto scrollbar-hide justify-start w-full gap-8 relative px-4 sm:px-0">
                                    {TABS_CONFIG.filter(tab => {
                                        if (tab.value === 'roadmap' && eventDetails.eventType === 'scrims') return false;
                                        return true;
                                    }).map((tab) => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            disabled={tab.value === 'results' && eventDetails.eventProgress !== 'completed'}
                                            className="relative rounded-none px-0 py-4 bg-transparent data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white font-bold uppercase tracking-widest text-[10px] sm:text-[11px] whitespace-nowrap flex-shrink-0 transition-all border-b-2 border-transparent data-[state=active]:border-purple-700 disabled:opacity-30"
                                        >
                                            <tab.icon size={14} className="mr-2" />
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            <div className="bg-gray-900/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {TABS_CONFIG.filter(tab => {
                                    if (tab.value === 'roadmap' && eventDetails.eventType === 'scrims') return false;
                                    return true;
                                }).map((tab) => (
                                    <TabsContent key={tab.value} value={tab.value} className="m-0">
                                        <tab.Component
                                            eventDetails={eventDetails}
                                            eventId={id}
                                            leaderboard={leaderboard}
                                        />
                                    </TabsContent>
                                ))}
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentById;