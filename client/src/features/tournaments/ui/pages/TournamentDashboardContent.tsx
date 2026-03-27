import { useEffect, useMemo, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Swords, Settings, Zap, LucideIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { ErrorFallback } from "@/components/ErrorFallback";
import {
    RoundsManager,
    ScrimsManager,
    TournamentOverview,
    RegisteredTeamsList,
} from "@/features/tournaments/ui/components";

// Context
import { useTournamentDashboard } from "@/features/tournaments/context/TournamentDashboardContext";
import { useTournamentDialogs } from "@/features/tournaments/context/TournamentDialogContext";

// Extracted sub-components
import { TournamentDashboardHeader } from "@/features/tournaments/ui/components/tournaments/TournamentDashboardHeader";
import { TournamentSettings } from "@/features/tournaments/ui/components/tournaments/TournamentSettings";
import { ResultsTab } from "@/features/tournaments/ui/components/details/ResultsTab";

interface TabConfig {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    isVisible: boolean;
    component: ReactNode;
}

export function TournamentDashboardContent() {
    const { id = "" } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { 
        eventDetails, 
        activeTab, 
        setActiveTab,
        isFocusMode
    } = useTournamentDashboard();
    const { openDialog } = useTournamentDialogs();

    const handleEdit = () => {
        if (!id) return;
        navigate(ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", id));
    };

    // Tab configuration
    const tabs = useMemo<TabConfig[]>(() => [
        {
            id: 'overview',
            label: 'Overview',
            icon: Trophy,
            color: 'data-[state=active]:border-purple-700',
            isVisible: true,
            component: <TournamentOverview />
        },
        {
            id: 'scrims',
            label: 'Scrims',
            icon: Zap,
            color: 'data-[state=active]:border-purple-700',
            isVisible: eventDetails?.eventProgress !== "pending" && eventDetails?.eventType === "scrims",
            component: <ScrimsManager />
        },
        {
            id: 'rounds',
            label: 'Rounds & Groups',
            icon: Swords,
            color: 'data-[state=active]:border-blue-700',
            isVisible: eventDetails?.eventProgress !== "pending" && eventDetails?.eventType !== "scrims",
            component: <RoundsManager />
        },
        {
            id: 'teams',
            label: 'Teams',
            icon: Users,
            color: 'data-[state=active]:border-green-700',
            isVisible: true,
            component: <RegisteredTeamsList />
        },
        {
            id: 'results',
            label: 'Results',
            icon: Trophy,
            color: 'data-[state=active]:border-amber-700',
            isVisible: eventDetails?.eventProgress !== "pending",
            component: <ResultsTab />
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            color: 'data-[state=active]:border-orange-700',
            isVisible: true,
            component: (
                <TournamentSettings
                    eventId={id}
                    eventType={eventDetails?.eventType}
                    registrationStatus={eventDetails?.registrationStatus}
                    onEdit={handleEdit}
                    onDelete={() => openDialog('deleteTournament')}
                />
            )
        }
    ], [id, eventDetails, openDialog]);

    // Filter visible tabs
    const visibleTabs = tabs.filter(tab => tab.isVisible);

    // Reset tab if current tab becomes hidden (e.g. event becomes pending)
    useEffect(() => {
        const isCurrentTabVisible = visibleTabs.some(tab => tab.id === activeTab);
        if (!isCurrentTabVisible) {
            setActiveTab('overview');
        }
    }, [visibleTabs, activeTab]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {!isFocusMode && (
                <TournamentDashboardHeader
                    title={eventDetails?.title || ""}
                    registrationStatus={eventDetails?.registrationStatus || ""}
                    eventProgress={eventDetails?.eventProgress || ""}
                    eventType={eventDetails?.eventType}
                    onBack={() => navigate(ORGANIZER_ROUTES.TOURNAMENTS)}
                    onStartEvent={() => openDialog('startTournament')}
                />
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {!isFocusMode && (
                    <div className="space-y-4">
                        <TabsList className="bg-transparent p-0 h-auto flex flex-nowrap overflow-x-auto scrollbar-hide justify-start w-full gap-8 border-b border-white/5 px-3">
                            {visibleTabs.map((tab: TabConfig) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className={`relative rounded-none px-0 py-4 bg-transparent data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px] whitespace-nowrap flex-shrink-0 transition-all border-b-2 border-transparent ${tab.color}`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>
                )}

                <div className="min-h-[500px] mt-0 bg-gray-900/20 border border-white/5 rounded-2xl px-2 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {visibleTabs.map((tab: TabConfig) => (
                        <TabsContent key={tab.id} value={tab.id} className="m-0 focus-visible:outline-none">
                            {activeTab === tab.id && (
                                <ErrorBoundary FallbackComponent={ErrorFallback}>
                                    {tab.component}
                                </ErrorBoundary>
                            )}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}
