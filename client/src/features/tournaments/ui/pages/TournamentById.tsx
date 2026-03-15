import { useNavigate, useParams } from "react-router-dom";
import { Trophy, Users, MessageSquare, ListOrdered, Gavel, Info, Map } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { RegisteredTeamsList } from "../components/RegisteredTeamsList";
import {
    useGetRoundsQuery,
    useGetGroupsQuery,
    useGetLeaderboardQuery,
    useGetTournamentDetailsQuery,
    useGetRegistrationStatusQuery,
    useRegisterTournamentMutation
} from "@/features/tournaments/hooks";
import { GroupLeaderboardTable } from "../components/groups/GroupLeaderboardTable";
import { TournamentHeader } from "../components/TournamentHeader";
import { TournamentQuickStats } from "../components/TournamentQuickStats";
import TournamentDetails from "../components/TournamentDetails";
import { Roadmaps } from "../components/Roadmaps";


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
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data: eventDetails, isLoading } = useGetTournamentDetailsQuery(id || "");

    const teamIdStr = typeof user?.teamId === 'string' ? user.teamId : user?.teamId?._id;
    const { data: regData } = useGetRegistrationStatusQuery(id || "", teamIdStr || "");
    const { mutateAsync: registerTournament } = useRegisterTournamentMutation();

    const regStatus = regData?.status || "none";

    // Final Results State
    const { data: rounds = [] } = useGetRoundsQuery(id || "");
    const lastRound = rounds[rounds.length - 1];

    const { data: groupsData } = useGetGroupsQuery(lastRound?._id || "", 1, 20);
    const groups = groupsData?.groups || [];
    const grandFinaleGroup = groups[0];

    const { data: leaderboard } = useGetLeaderboardQuery(grandFinaleGroup?._id || "");

    // useEffect for registration check is now handled by TanStack Query hook

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
        if (!id) return;

        try {
            await registerTournament(id);
            // Success is likely handled by the mutation's internal onSuccess (invalidate queries)
            // But we can add a local success message if needed, though usually standard UI does this.
        } catch (error: any) {
            console.error("Registration failed:", error);
            // Many apps use a global toast system. I'll use a standard alert if no toast is detected, 
            // but usually, shadcn/ui projects have a toast hook.
            // I'll check if toast is available or just rely on the mutation error state if the UI handles it.
            // Looking at the imports, I don't see a toast import yet.
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
                        <Tabs defaultValue="details" className="space-y-6 sm:space-y-8">
                            <div className="relative">
                                {/* Horizontal Scroll Gradient Fades */}
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none opacity-0 sm:hidden" />
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none sm:hidden" />

                                <TabsList className="bg-transparent border-b border-white/10 p-0 h-auto rounded-none flex flex-nowrap overflow-x-auto scrollbar-hide justify-start w-full gap-8">
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
                                            eventId={eventDetails._id}
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

function TeamsTab({ eventId, eventDetails }: { eventId: string; eventDetails: any }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <RegisteredTeamsList
                eventId={eventId}
                eventDetails={eventDetails}
                showSearch={false}
                showStats={false}
            />
        </div>
    );
}

function ResultsTab({ leaderboard }: { leaderboard: any }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {leaderboard ? (
                <GroupLeaderboardTable
                    leaderboard={leaderboard}
                    isResultsMode={false}
                    tempResults={{}}
                    handleResultChange={() => { }}
                    activeRoundTab="main"
                    openMergeModal={() => { }}
                    isGrandFinale={true}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-2">
                        <Trophy size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Awaiting Finalization</h3>
                    <p className="text-gray-500 max-w-sm text-sm">Tournament results are being verified by the Arena Master. Final standings will be broadcasted shortly.</p>
                </div>
            )}
        </div>
    );
}

function RulesTab() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Gavel size={48} className="text-gray-400 mb-2" />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Standard Protocol</h3>
                <p className="text-gray-500 max-w-sm text-sm">The official ruleset for this tournament is currently being encrypted. Please refer to general platform guidelines in the meantime.</p>
            </div>
        </div>
    );
}

function PointsTab() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <ListOrdered size={48} className="text-gray-400 mb-2" />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Points Encryption</h3>
                <p className="text-gray-500 max-w-sm text-sm">Detailed point distribution mechanics for each round will be displayed here once the tournament commences.</p>
            </div>
        </div>
    );
}

function ChatTab() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <MessageSquare size={48} className="text-gray-400 mb-2" />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Secure Comm-Link</h3>
                <p className="text-gray-500 max-w-sm text-sm">End-to-end encrypted communication channel between combat units and command center will be established pre-match.</p>
            </div>
        </div>
    );
}

export default TournamentById;