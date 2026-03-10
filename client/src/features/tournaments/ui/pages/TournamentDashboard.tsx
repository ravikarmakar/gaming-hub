import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trophy,
    Users,
    Swords,
    Settings,
    Trash2,
    Edit2,
    AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useEventStore } from "@/features/events/store/useEventStore";
import { useGetRoundsQuery, useFinishEventMutation, useStartTournamentMutation } from "../../hooks";
import { RoundsManager } from "../components/RoundsManager";
import { TournamentOverview } from "../components/TournamentOverview";
import { RegisteredTeamsList } from "../components/RegisteredTeamsList";

// Extracted sub-components
import { TournamentDashboardHeader } from "../components/tournaments/TournamentDashboardHeader";

export default function TournamentDashboard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const { eventDetails, fetchEventDetailsById, deleteEvent } = useEventStore();
    const { data: rounds = [] } = useGetRoundsQuery(id || "");
    const { mutateAsync: finishEvent, isPending: isFinishing } = useFinishEventMutation();
    const { mutateAsync: startEvent } = useStartTournamentMutation();

    useEffect(() => {
        if (id) {
            fetchEventDetailsById(id);
        }
    }, [id, fetchEventDetailsById]);

    if (!id) {
        return <div className="p-6 text-white">Invalid Tournament ID</div>;
    }

    const handleDelete = async () => {
        if (!id) return;
        if (confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) {
            const success = await deleteEvent(id);
            if (success) {
                toast.success("Tournament deleted successfully");
                navigate(ORGANIZER_ROUTES.TOURNAMENTS);
            }
        }
    };

    const handleEdit = () => {
        if (!id) return;
        navigate(ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", id));
    };

    const handleFinishTournament = async () => {
        if (!id) return;
        if (!window.confirm("Are you sure you want to finish this tournament? This will publish the final leaderboard.")) return;

        try {
            await finishEvent(id);
            fetchEventDetailsById(id); // Refresh status
        } catch (error) {
            console.error(error);
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
                        fetchEventDetailsById(id);
                    } catch (error) {
                        console.error(error);
                    }
                }}
                onFinishEvent={handleFinishTournament}
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
                        <TournamentOverview />
                    </TabsContent>

                    {!(eventDetails?.registrationStatus === "registration-open" && eventDetails?.eventProgress === "pending") && (
                        <TabsContent value="rounds" className="m-0">
                            <RoundsManager eventId={id} />
                        </TabsContent>
                    )}
                    <TabsContent value="teams" className="m-0">
                        <RegisteredTeamsList eventId={id} />
                    </TabsContent>
                    <TabsContent value="settings" className="m-0 p-6 space-y-8">
                        {/* Actions Section */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-400" />
                                General Actions
                            </h3>
                            <p className="text-xs mb-6 text-red-400/80 italic">
                                <span className="font-bold not-italic text-red-500 mr-1">Note:</span>
                                Tournament details cannot be modified once registration has closed. Subject to platform <span className="font-bold text-white hover:underline cursor-pointer" onClick={() => navigate('/terms')}>terms and conditions</span>.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Button
                                    onClick={handleEdit}
                                    variant="outline"
                                    disabled={eventDetails?.registrationStatus !== "registration-open"}
                                    className="h-auto p-4 flex flex-col items-center justify-center gap-2 border-white/10 hover:bg-white/5 hover:border-purple-500/50 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Edit2 className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-gray-300">Edit Details</span>
                                    <span className="text-xs text-gray-500">Update Title, Description, Rules</span>
                                </Button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Danger Zone
                            </h3>
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-200">Delete Tournament</h4>
                                    <p className="text-sm text-gray-500">Permanently remove this tournament and all its data.</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Tournament
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    );
}
