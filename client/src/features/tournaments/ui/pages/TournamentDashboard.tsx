import { useState } from 'react';
import toast from "react-hot-toast";
import { useParams, useNavigate } from 'react-router-dom';
import {
    Trophy,
    Users,
    Swords,
    Settings,
    Zap
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useStartTournamentMutation, useDeleteTournamentMutation, useGetTournamentDetailsQuery } from "../../hooks";
import { RoundsManager } from "../components/RoundsManager";
import { ScrimsManager } from "../components/ScrimsManager";
import { TournamentOverview } from "../components/TournamentOverview";
import { RegisteredTeamsList } from "../components/RegisteredTeamsList";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

// Extracted sub-components
import { TournamentDashboardHeader } from "../components/tournaments/TournamentDashboardHeader";
import { TournamentSettings } from "../components/tournaments/TournamentSettings";

export default function TournamentDashboard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const { data: eventDetails } = useGetTournamentDetailsQuery(id || "");
    const { mutateAsync: startEvent } = useStartTournamentMutation();
    const { mutateAsync: deleteTournament } = useDeleteTournamentMutation();
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Reset tab if current tab becomes hidden (e.g. event becomes pending)
    const canShowRounds = eventDetails?.eventProgress !== "pending";
    if (canShowRounds === false && (activeTab === 'rounds' || activeTab === 'scrims')) {
        setActiveTab('overview');
    }

    if (!id) {
        return <div className="p-6 text-white">Invalid Tournament ID</div>;
    }

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await deleteTournament(id);
            toast.success("Tournament deleted successfully");
            navigate(ORGANIZER_ROUTES.TOURNAMENTS);
        } catch (error) {
            console.error("Failed to delete tournament:", error);
            toast.error("Failed to delete tournament. Please try again.");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleEdit = () => {
        if (!id) return;
        navigate(ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", id));
    };

    const handleStartTournament = async () => {
        if (!id) return;
        setIsStarting(true);
        try {
            await startEvent(id);
            toast.success("Tournament started successfully");
            // Cache update is handled by mutation onSuccess
        } catch (error) {
            console.error("Failed to start tournament:", error);
            toast.error("Failed to start tournament. Please try again.");
        } finally {
            setIsStarting(false);
            setIsStartDialogOpen(false);
        }
    };

    console.log("eventDetails", eventDetails);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            {!isFocusMode && (
                <TournamentDashboardHeader
                    title={eventDetails?.title || ""}
                    registrationStatus={eventDetails?.registrationStatus || ""}
                    eventProgress={eventDetails?.eventProgress || ""}
                    eventType={eventDetails?.eventType}
                    onBack={() => navigate(ORGANIZER_ROUTES.TOURNAMENTS)}
                    onStartEvent={() => setIsStartDialogOpen(true)}
                />
            )}


            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {!isFocusMode && (
                    <div className="space-y-4">
                        <TabsList className="bg-transparent p-0 h-auto flex flex-nowrap overflow-x-auto scrollbar-hide justify-start w-full gap-8 border-b border-white/5 px-6">
                            <TabsTrigger value="overview" className="relative rounded-none px-0 py-4 bg-transparent data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px] whitespace-nowrap flex-shrink-0 transition-all border-b-2 border-transparent data-[state=active]:border-purple-700">
                                <Trophy className="w-4 h-4 mr-2" />
                                Overview
                            </TabsTrigger>

                            {/* Hide Scrims/Rounds Tab if not started */}
                            {(eventDetails?.eventProgress !== "pending") && (
                                eventDetails?.eventType === "scrims" ? (
                                    <TabsTrigger value="scrims" className="relative rounded-none px-0 py-4 bg-transparent data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px] whitespace-nowrap flex-shrink-0 transition-all border-b-2 border-transparent data-[state=active]:border-purple-700">
                                        <Zap className="w-4 h-4 mr-2" />
                                        Scrims
                                    </TabsTrigger>
                                ) : (
                                    <TabsTrigger value="rounds" className="relative rounded-none px-0 py-4 bg-transparent data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px] whitespace-nowrap flex-shrink-0 transition-all border-b-2 border-transparent data-[state=active]:border-blue-700">
                                        <Swords className="w-4 h-4 mr-2" />
                                        Rounds & Groups
                                    </TabsTrigger>
                                )
                            )}

                            <TabsTrigger value="teams" className="relative rounded-none px-0 py-4 bg-transparent data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px] whitespace-nowrap flex-shrink-0 transition-all border-b-2 border-transparent data-[state=active]:border-green-700">
                                <Users className="w-4 h-4 mr-2" />
                                Teams
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="relative rounded-none px-0 py-4 bg-transparent data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px] whitespace-nowrap flex-shrink-0 transition-all border-b-2 border-transparent data-[state=active]:border-orange-700">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </TabsTrigger>
                        </TabsList>
                    </div>
                )}

                <div className="min-h-[500px] mt-0 bg-gray-900/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <TabsContent value="overview" className="m-0">
                        <TournamentOverview eventDetails={eventDetails} />
                    </TabsContent>

                    {(eventDetails?.eventProgress !== "pending") && (
                        eventDetails?.eventType === "scrims" ? (
                            <TabsContent value="scrims" className="m-0">
                                <ScrimsManager eventId={id} />
                            </TabsContent>
                        ) : (
                            <TabsContent value="rounds" className="m-0">
                                <RoundsManager
                                    eventId={id}
                                    isFocusMode={isFocusMode}
                                    onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                                />
                            </TabsContent>
                        )
                    )}
                    <TabsContent value="teams" className="m-0">
                        <RegisteredTeamsList eventId={id} />
                    </TabsContent>
                    <TabsContent value="settings" className="m-0">
                        <TournamentSettings
                            eventId={id}
                            eventType={eventDetails?.eventType}
                            registrationStatus={eventDetails?.registrationStatus}
                            onEdit={handleEdit}
                            onDelete={() => setIsDeleteDialogOpen(true)}
                        />
                    </TabsContent>
                </div>
            </Tabs>

            <ConfirmActionDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Tournament"
                description="Are you sure you want to delete this tournament? This action cannot be undone and all associated data will be permanently removed."
                actionLabel="Delete Tournament"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDelete}
            />


            <ConfirmActionDialog
                open={isStartDialogOpen}
                onOpenChange={setIsStartDialogOpen}
                title="Start Event"
                description="Are you sure you want to start this event? This will close registrations and move the event to the ongoing state. This action cannot be undone."
                actionLabel="Start Event"
                variant="default"
                isLoading={isStarting}
                onConfirm={handleStartTournament}
            />
        </div>
    );
}
