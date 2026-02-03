import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trophy,
    Users,
    Swords,
    Settings,
    PlayCircle,
    Trash2,
    Edit2,
    AlertTriangle,
    Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useEventStore } from "@/features/events/store/useEventStore";
import { useTournamentStore } from "@/features/organizer/store/useTournamentStore";
import { RoundsManager } from "@/features/organizer/ui/components/RoundsManager";

import { TournamentOverview } from "@/features/organizer/ui/components/TournamentOverview";
import { RegisteredTeamsList } from "@/features/organizer/ui/components/RegisteredTeamsList";

export default function OrganizerTournamentDashboard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const { eventDetails, fetchEventDetailsById, deleteEvent } = useEventStore();
    const { rounds, fetchRounds, finishEvent } = useTournamentStore();
    const [isFinishing, setIsFinishing] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEventDetailsById(id);
            fetchRounds(id);
        }
    }, [id, fetchEventDetailsById, fetchRounds]);

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

        setIsFinishing(true);
        const success = await finishEvent(id);
        setIsFinishing(false);
        if (success) {
            toast.success("Tournament finished! Final results are now public.");
            fetchEventDetailsById(id); // Refresh status
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                            {eventDetails?.title || "Loading..."}
                        </h1>
                        <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10">
                            {eventDetails?.registrationStatus?.toUpperCase() || "LOADING"}
                        </Badge>
                        <Badge variant="outline" className="border-blue-500/20 text-blue-400 bg-blue-500/10">
                            {eventDetails?.eventProgress?.toUpperCase() || "LOADING"}
                        </Badge>
                    </div>
                    <p className="text-gray-400">Manage rounds, groups, and results for Event ID: {id}</p>
                </div>

                <div className="flex gap-3">
                    {/* Start Event Button - Only visible when not started */}
                    {(eventDetails?.eventProgress === "pending") && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={async () => {
                                if (await useTournamentStore.getState().startEvent(id)) {
                                    toast.success("Event Started!");
                                    fetchEventDetailsById(id);
                                }
                            }}
                        >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Event
                        </Button>
                    )}

                    {/* End Tournament Button */}
                    {eventDetails?.eventProgress === "ongoing" && (
                        <Button
                            variant="outline"
                            className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleFinishTournament}
                            disabled={!canFinish || isFinishing}
                        >
                            {isFinishing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Trophy className="w-4 h-4 mr-2" />
                            )}
                            Finish Tournament
                        </Button>
                    )}

                    {/* Resume Button? Maybe not needed if we have Start Event logic distinct. Keeping generic if needed or removing as per plan */}
                </div>
            </div>

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
