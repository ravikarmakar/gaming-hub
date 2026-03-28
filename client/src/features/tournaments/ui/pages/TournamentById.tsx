import { useNavigate, useParams } from "react-router-dom";
import { Trophy, Users, MessageSquare, ListOrdered, Gavel, Info, Map } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/features/auth";

// Context Providers
import { TournamentDialogProvider } from "@/features/tournaments/context/TournamentDialogContext";
import { TournamentDashboardProvider, useTournamentDashboard } from "@/features/tournaments/context/TournamentDashboardContext";
import { TournamentRoundsProvider } from "@/features/tournaments/context/TournamentRoundsContext";
import { TournamentGroupsProvider } from "@/features/tournaments/context/TournamentGroupsContext";
import { TournamentLoading } from "@/features/tournaments/ui/components";

import {
    TournamentHeader,
    TournamentQuickStats,
    Roadmaps,
    TournamentDetails
} from "@/features/tournaments/ui/components";

import {
    useGetRegistrationStatusQuery,
    useRegisterTournamentMutation
} from "@/features/tournaments/hooks";

// Extracted Tab Components
import { TeamsTab } from "@/features/tournaments/ui/components/details/TeamsTab";
import { ResultsTab } from "@/features/tournaments/ui/components/details/ResultsTab";
import { RulesTab } from "@/features/tournaments/ui/components/details/RulesTab";
import { PointsTab } from "@/features/tournaments/ui/components/details/PointsTab";
import { ChatTab } from "@/features/tournaments/ui/components/details/ChatTab";

const TABS_CONFIG = [
    { value: 'details', label: 'Details', icon: Info, color: 'purple', Component: TournamentDetails },
    { value: 'roadmap', label: 'Roadmap', icon: Map, color: 'indigo', Component: Roadmaps },
    { value: 'rules', label: 'Rules', icon: Gavel, color: 'zinc', Component: RulesTab },
    { value: 'points', label: 'Points', icon: ListOrdered, color: 'zinc', Component: PointsTab },
    { value: 'teams', label: 'Teams', icon: Users, color: 'blue', Component: TeamsTab },
    { value: 'chat', label: 'Chat', icon: MessageSquare, color: 'indigo', Component: ChatTab },
    { value: 'results', label: 'Results', icon: Trophy, color: 'amber', Component: ResultsTab },
];

/**
 * TournamentByIdContent is the presentational layer for the public tournament view.
 * It consumes TournamentDashboardContext for event data, ensuring consistency
 * across all tabs and sub-components.
 */
const TournamentByIdContent = () => {
    const { id = "" } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useCurrentUser();
    const [activeTab, setActiveTab] = useState("details");

    // Consume centralized tournament data from context
    const { eventDetails, isLoading } = useTournamentDashboard();

    const teamIdStr = typeof user?.teamId === 'string' ? user.teamId : user?.teamId?._id;
    const { data: regData } = useGetRegistrationStatusQuery(eventDetails?._id || id, teamIdStr || "", {
        enabled: !!eventDetails?._id && !!teamIdStr
    });
    const { mutateAsync: registerTournament } = useRegisterTournamentMutation();

    const regStatus = regData?.status || "none";

    if (isLoading) {
        return <TournamentLoading variant="fullscreen" />;
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
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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
                                            disabled={tab.value === 'results' && eventDetails.eventProgress === 'pending'}
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
                                        {activeTab === tab.value && (
                                            <ErrorBoundary FallbackComponent={ErrorFallback}>
                                                <tab.Component
                                                    eventDetails={eventDetails}
                                                    eventId={id}
                                                />
                                            </ErrorBoundary>
                                        )}
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

/**
 * TournamentById is the entry point for the public tournament page.
 * It initializes all necessary providers to ensure context-driven components
 * (Roadmaps, Results, Teams) function correctly in both public and management views.
 */
const TournamentById = () => {
    const { id = "" } = useParams<{ id: string }>();

    return (
        <TournamentDialogProvider>
            <TournamentDashboardProvider eventId={id}>
                <TournamentRoundsProvider>
                    <TournamentGroupsProvider>
                        <TournamentByIdContent />
                    </TournamentGroupsProvider>
                </TournamentRoundsProvider>
            </TournamentDashboardProvider>
        </TournamentDialogProvider>
    );
}

export default TournamentById;