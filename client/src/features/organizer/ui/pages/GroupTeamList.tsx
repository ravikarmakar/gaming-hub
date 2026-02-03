import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    MessageSquare,
    Clock,
    Calendar,
    Swords,
    Trophy,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useTournamentStore, Group } from "@/features/organizer/store/useTournamentStore";

export default function GroupTeamList() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { fetchGroupDetails } = useTournamentStore();

    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!groupId) return;
            setIsLoading(true);
            const data = await fetchGroupDetails(groupId);
            if (data) {
                setGroup(data);
                // Also fetch event details if possible to get event name
                // Group model usually has roundId, and round has eventId
                // For simplicity, we assume we want event info
            }
            setIsLoading(false);
        };
        loadData();
    }, [groupId, fetchGroupDetails]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0514]">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#0a0514] text-gray-400">
                <Trophy className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl font-bold">Group not found</p>
                <Button onClick={() => navigate(-1)} variant="ghost" className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0514] text-white p-6 pb-20">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                                {group.groupName}
                                <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                                    Live Stats
                                </Badge>
                            </h1>
                            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                <Swords className="w-4 h-4" />
                                Battle Royale Match Assignment
                            </p>
                        </div>
                    </div>
                </div>

                {/* Group Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gray-900/40 border-white/5 p-5 space-y-3 backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-purple-400">
                            <Calendar className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Scheduled Date</span>
                        </div>
                        <p className="text-xl font-bold">
                            {new Date(group.matchTime).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                    </Card>

                    <Card className="bg-gray-900/40 border-white/5 p-5 space-y-3 backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Match Time</span>
                        </div>
                        <p className="text-xl font-bold">
                            {new Date(group.matchTime).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </p>
                    </Card>

                    <Card className="bg-gray-900/40 border-white/5 p-5 space-y-3 backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-green-400">
                            <Trophy className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Matches</span>
                        </div>
                        <p className="text-xl font-bold">
                            {group.totalMatch} Full Matches
                        </p>
                    </Card>
                </div>

                {/* Teams List Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Users className="w-6 h-6 text-purple-500" />
                            Assigned Teams
                            <span className="text-gray-600 font-normal">({group.teams?.length || 0})</span>
                        </h2>

                        {/* Future Chat Implementation */}
                        <Button
                            variant="outline"
                            className="border-white/10 text-gray-400 hover:bg-white/5 gap-2"
                            onClick={() => toast.success("Chat feature coming soon!")}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Team Chat
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.teams?.map((team) => (
                            <Card
                                key={team._id}
                                className="bg-white/[0.02] border-white/5 p-4 flex items-center justify-between hover:border-purple-500/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden border border-white/5">
                                        {team.teamLogo ? (
                                            <img src={team.teamLogo} alt={team.teamName} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-6 h-6 text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors">
                                            {team.teamName}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Verified Team</p>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="text-gray-600 hover:text-purple-400">
                                    <MessageSquare className="w-4 h-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>

                    {group.teams?.length === 0 && (
                        <div className="py-20 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                            <p className="text-gray-500">No teams assigned to this group yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
