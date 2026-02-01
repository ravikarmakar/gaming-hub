import { useEffect, useState } from "react";
import {
    Users,
    Search,
    ExternalLink,
    MoreHorizontal,
    Mail,
    Shield,
    Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEventStore } from "@/features/events/store/useEventStore";
import { Badge } from "@/components/ui/badge";

interface RegisteredTeamsListProps {
    eventId: string;
}

export const RegisteredTeamsList = ({ eventId }: RegisteredTeamsListProps) => {
    const { registerdTeams, fetchRegisteredTeams, isTeamsLoading } = useEventStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (eventId) {
            fetchRegisteredTeams(eventId);
        }
    }, [eventId, fetchRegisteredTeams]);

    const filteredTeams = registerdTeams.filter(team =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isTeamsLoading && registerdTeams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Retrieving registered rosters...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-purple-500/20"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <Users className="w-4 h-4" />
                    Total Verified: {registerdTeams.length}
                </div>
            </div>

            {/* Teams Grid */}
            {filteredTeams.length === 0 ? (
                <div className="py-24 text-center rounded-2xl border-2 border-dashed border-white/5 bg-gray-900/10">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300">No Teams Recruited</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-1">
                        {searchQuery ? "No teams match your current search criteria." : "Once teams register for the tournament, they will appear in this roster."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeams.map((team) => (
                        <Card key={team._id} className="group relative overflow-hidden bg-white/5 border-white/10 hover:border-purple-500/30 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white">
                                        <DropdownMenuItem className="focus:bg-white/10 text-xs">
                                            <Mail className="w-3.5 h-3.5 mr-2" /> Message Captain
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-white/10 text-xs text-red-400">
                                            <Shield className="w-3.5 h-3.5 mr-2" /> DQ Team
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <CardContent className="p-5 flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                                    <AvatarImage src={team.teamLogo} />
                                    <AvatarFallback className="bg-purple-600/20 text-purple-300 font-bold text-xl">
                                        {team.teamName[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="font-black text-white truncate leading-tight group-hover:text-purple-400 transition-colors">
                                        {team.teamName}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {team.tag && (
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-white/10 text-gray-400">
                                                {team.tag}
                                            </Badge>
                                        )}
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            {team.memberCount || 4} Members
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl"
                                    title="View Team Profile"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
