import { useEffect, useState } from "react";
import { Trophy, Search, Filter } from "lucide-react";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { MemberHeader } from "../components/MemberHeader";
import { TournamentItem } from "../components/TournamentItem";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const TeamTournamentsPage = () => {
    const { user } = useAuthStore();
    const { currentTeam, teamTournaments, fetchTeamTournaments, isLoading } = useTeamStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (user?.teamId) {
            fetchTeamTournaments(user.teamId);
        }
    }, [user?.teamId, fetchTeamTournaments]);

    const filteredTournaments = teamTournaments.filter((t) => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || t.eventProgress === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!currentTeam) return null;

    return (
        <div className="min-h-screen space-y-8">
            <MemberHeader
                currentUserId={user?._id ?? ""}
                teamId={currentTeam._id}
                members={currentTeam.teamMembers ?? []}
                showInfo={false}
                onInfoToggle={() => { }}
                title="Team Tournaments"
                showActions={false}
            />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0F111A]/40 p-4 rounded-xl border border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search tournaments..."
                        className="pl-10 bg-zinc-900/50 border-white/5 focus:border-purple-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-400 shrink-0">
                        <Filter className="w-4 h-4" />
                        <span>Filter:</span>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-40 bg-zinc-900/50 border-white/5 focus:ring-purple-500/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="registration-open">Open</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
                    ))}
                </div>
            ) : filteredTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTournaments.map((tournament) => (
                        <TournamentItem
                            key={tournament._id}
                            id={tournament._id}
                            name={tournament.title}
                            game={tournament.game}
                            image={tournament.image}
                            orgName={tournament.orgId?.orgName}
                            orgImage={tournament.orgId?.imageUrl}
                            type={tournament.eventType}
                            date={new Date(tournament.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                            prize={tournament.prizePool > 0 ? `$${tournament.prizePool.toLocaleString()}` : "Free Entry"}
                            status={tournament.eventProgress === 'completed' ? 'completed' : tournament.eventProgress === 'ongoing' ? 'ongoing' : 'upcoming'}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#0F111A]/60 rounded-2xl border border-dashed border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
                    <div className="p-4 rounded-full bg-white/[0.03] mb-4">
                        <Trophy className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
                    <p className="text-gray-400 max-w-md">
                        {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Your team hasn't participated in any tournaments yet. Join one today and start your journey!"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TeamTournamentsPage;
