import { useState } from 'react';
import toast from "react-hot-toast";
import { useParams, useNavigate } from 'react-router-dom';
import {
    Trophy,
    Users,
    Swords,
    Settings,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useStartTournamentMutation, useDeleteTournamentMutation, useGetTournamentDetailsQuery } from "../../hooks";
import { RoundsManager } from "../components/RoundsManager";
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
                    onBack={() => navigate(ORGANIZER_ROUTES.TOURNAMENTS)}
                    onStartEvent={() => setIsStartDialogOpen(true)}
                />
            )}


            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {!isFocusMode && (
                    <TabsList className="bg-gray-900/60 p-1 border border-white/5 h-auto grid grid-cols-4 lg:inline-flex lg:w-auto gap-2">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300">
                            <Trophy className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>

                        {/* Hide Rounds Tab if not started */}
                        {!(eventDetails?.registrationStatus === "registration-open" && eventDetails?.eventProgress === "pending") && (
                            <TabsTrigger value="rounds" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
                                <Swords className="w-4 h-4 mr-2" />
                                Rounds & Groups
                            </TabsTrigger>
                        )}

                        <TabsTrigger value="teams" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-300">
                            <Users className="w-4 h-4 mr-2" />
                            Teams
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-300">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                )}

                <Card className="min-h-[500px] border-white/5 bg-gray-900/20 backdrop-blur-md">
                    <TabsContent value="overview" className="m-0">
                        <TournamentOverview eventDetails={eventDetails} />
                    </TabsContent>

                    {!(eventDetails?.registrationStatus === "registration-open" && eventDetails?.eventProgress === "pending") && (
                        <TabsContent value="rounds" className="m-0">
                            <RoundsManager
                                eventId={id}
                                isFocusMode={isFocusMode}
                                onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                            />
                        </TabsContent>
                    )}
                    <TabsContent value="teams" className="m-0">
                        <RegisteredTeamsList eventId={id} />
                    </TabsContent>
                    <TabsContent value="settings" className="m-0 p-6">
                        <TournamentSettings
                            eventId={id}
                            eventType={eventDetails?.eventType}
                            registrationStatus={eventDetails?.registrationStatus}
                            onEdit={handleEdit}
                            onDelete={() => setIsDeleteDialogOpen(true)}
                        />
                    </TabsContent>
                </Card>
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
