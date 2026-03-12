import { useState } from 'react';
import toast from "react-hot-toast";
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trophy,
    Users,
    Swords,
    Settings,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useGetRoundsQuery, useFinishTournamentMutation, useStartTournamentMutation, useDeleteTournamentMutation, useGetTournamentDetailsQuery } from "../../hooks";
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
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
    const { data: eventDetails, refetch: refetchEventDetails } = useGetTournamentDetailsQuery(id || "");
    const { data: rounds = [] } = useGetRoundsQuery(id || "");
    const { mutateAsync: finishEvent, isPending: isFinishing } = useFinishTournamentMutation();
    const { mutateAsync: startEvent } = useStartTournamentMutation();
    const { mutateAsync: deleteTournament } = useDeleteTournamentMutation();

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

    const handleFinishTournament = async () => {
        if (!id) return;
        try {
            await finishEvent(id);
            refetchEventDetails(); // Refresh status
        } catch (error) {
            console.error(error);
        } finally {
            setIsFinishDialogOpen(false);
        }
    };

    const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
    const isGrandFinale = lastRound?.groups && lastRound.groups.length === 1;
    const allRoundsCompleted = rounds.length > 0 && rounds.every(r => r.status === 'completed');
    const canFinish = allRoundsCompleted || (isGrandFinale && lastRound?.status === 'completed');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="text-gray-400 hover:text-white pl-0 gap-2"
                onClick={() => navigate(ORGANIZER_ROUTES.TOURNAMENTS)}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Tournaments
            </Button>

            {/* Header Section */}
            <TournamentDashboardHeader
                title={eventDetails?.title || ""}
                registrationStatus={eventDetails?.registrationStatus || ""}
                eventProgress={eventDetails?.eventProgress || ""}
                onStartEvent={async () => {
                    if (!id) return;
                    try {
                        await startEvent(id);
                        refetchEventDetails();
                    } catch (error) {
                        console.error(error);
                    }
                }}
                onFinishEvent={() => setIsFinishDialogOpen(true)}
                canFinish={canFinish ?? false}
                isFinishing={isFinishing}
            />

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

                <Card className="min-h-[500px] border-white/5 bg-gray-900/20 backdrop-blur-md">
                    <TabsContent value="overview" className="m-0">
                        <TournamentOverview eventDetails={eventDetails} />
                    </TabsContent>

                    {!(eventDetails?.registrationStatus === "registration-open" && eventDetails?.eventProgress === "pending") && (
                        <TabsContent value="rounds" className="m-0">
                            <RoundsManager eventId={id} />
                        </TabsContent>
                    )}
                    <TabsContent value="teams" className="m-0">
                        <RegisteredTeamsList eventId={id} />
                    </TabsContent>
                    <TabsContent value="settings" className="m-0 p-6">
                        <TournamentSettings
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
                open={isFinishDialogOpen}
                onOpenChange={setIsFinishDialogOpen}
                title="Finish Tournament"
                description="Are you sure you want to finish this tournament? This will publish the final leaderboard and mark the event as completed."
                actionLabel="Finish"
                variant="warning"
                isLoading={isFinishing}
                onConfirm={handleFinishTournament}
            />
        </div>
    );
}
