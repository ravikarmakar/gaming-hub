import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, ExternalLink } from "lucide-react";
import debounce from "lodash.debounce";
import { useInView } from "react-intersection-observer";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";

import { useGetInfiniteRegisteredTeamsQuery, useGetInfiniteInvitedTeamsQuery, useGetInfiniteT1SpecialTeamsQuery } from "@/features/tournaments/hooks/useTournamentQueries";
import { useTournamentDashboard } from "@/features/tournaments/context/TournamentDashboardContext";
import { TournamentLoading, TournamentEmpty } from "@/features/tournaments/ui/components";

interface RegisteredTeamsListProps {
    eventId?: string;
    eventDetails?: any;
    showSearch?: boolean;
    showStats?: boolean;
}

/**
 * RegisteredTeamsList displays the teams registered, invited, or special for a tournament.
 * Consumes TournamentDashboardContext for eventId and eventDetails.
 */
export const RegisteredTeamsList = ({
    eventId: propEventId,
    eventDetails: propEventDetails,
    showSearch = true,
    showStats = true
}: RegisteredTeamsListProps) => {
    const context = useTournamentDashboard();
    const eventId = propEventId || context.eventId;
    const event = propEventDetails || context.eventDetails;
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<"registered" | "invited" | "t1-special">("registered");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const handleSearch = useCallback(
        debounce((val: string) => {
            setDebouncedSearch(val);
        }, 500),
        []
    );

    useEffect(() => {
        handleSearch(searchQuery);
        return () => handleSearch.cancel(); // Cancel debounce on unmount/re-render
    }, [searchQuery, handleSearch]);

    // Reset active tab if it becomes hidden
    useEffect(() => {
        if (!event) return; // Guard against undefined event during loading

        const isInvitedHidden = !event?.hasInvitedTeams && activeTab === 'invited';
        const isT1Hidden = !event?.hasT1SpecialTeams && activeTab === 't1-special';
        if (isInvitedHidden || isT1Hidden) {
            setActiveTab('registered');
        }
    }, [event, activeTab]);

    const registeredQuery = useGetInfiniteRegisteredTeamsQuery(eventId, debouncedSearch, {
        enabled: activeTab === "registered"
    });
    const invitedQuery = useGetInfiniteInvitedTeamsQuery(eventId, debouncedSearch, {
        enabled: activeTab === "invited"
    });
    const t1SpecialQuery = useGetInfiniteT1SpecialTeamsQuery(eventId, debouncedSearch, {
        enabled: activeTab === "t1-special"
    });

    const activeQuery = activeTab === "registered" ? registeredQuery : activeTab === "invited" ? invitedQuery : t1SpecialQuery;
    const { ref, inView } = useInView();

    const { hasNextPage, isFetchingNextPage, fetchNextPage } = activeQuery;
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allTeams = useMemo(() => {
        if (!activeQuery.data?.pages) return [];
        return activeQuery.data.pages.flatMap((page: any) => page?.teams || []) || [];
    }, [activeQuery.data]);

    return (
        <div className="flex flex-col min-h-[700px] w-full">
            <div className="p-2 border-b border-white/5 space-y-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full md:w-auto">
                        <TabsList className="bg-transparent p-0 border-none">
                            <TabsTrigger value="registered" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-6">
                                Registered
                            </TabsTrigger>
                            {event?.hasInvitedTeams && (
                                <TabsTrigger value="invited" className="data-[state=active]:bg-purple-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-6">
                                    Invited
                                </TabsTrigger>
                            )}
                            {event?.hasT1SpecialTeams && (
                                <TabsTrigger value="t1-special" className="data-[state=active]:bg-purple-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-6">
                                    T1 Special
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>

                    {(showSearch || showStats) && (
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                            {showSearch && (
                                <div className="relative w-full sm:w-80 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        placeholder="Search Teams..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-8 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:ring-purple-500/20"
                                    />
                                </div>
                            )}
                            {showStats && (
                                <div className="flex items-center gap-2 px-0 h-10 bg-transparent text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Users className="w-3.5 h-3.5 text-purple-400" />
                                    {debouncedSearch ? "Matches: " : "Total Teams: "}
                                    {debouncedSearch
                                        ? allTeams.length
                                        : (
                                            activeTab === "registered"
                                                ? (event?.joinedSlots || 0)
                                                : activeTab === "invited"
                                                    ? (event?.invitedTeams?.length || 0)
                                                    : (event?.t1SpecialTeams?.length || 0)
                                        )
                                    }
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-transparent w-full relative">
                {activeQuery.isLoading ? (
                    <TournamentLoading text="Assembling Squads..." />
                ) : allTeams.length > 0 ? (
                    <div className="absolute inset-0 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allTeams.map((team: any, idx: number) => {
                                if (!team) return null;
                                const teamKey = team._id || `team-${idx}-${team.teamName}`;
                                return (
                                    <div key={teamKey} className="bg-gray-900/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:bg-white/[0.03] transition-all backdrop-blur-sm">
                                        <Avatar className="h-12 w-12 border border-white/10 shadow-lg group-hover:border-purple-500/30 transition-colors">
                                            <AvatarImage src={team.imageUrl} />
                                            <AvatarFallback className="bg-purple-600/20 text-purple-300 font-bold">
                                                {team.teamName?.[0]?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">{team.teamName || 'Unknown Team'}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{team.tag || 'NO TAG'} • {team.teamMembers?.length || 0} Members</p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-gray-400 hover:text-white"
                                            onClick={() => navigate(TEAM_ROUTES.PROFILE.replace(':id', team._id))}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                        <div ref={ref} className="h-10" />
                    </div>
                ) : (
                    <TournamentEmpty 
                        message="No Teams Found" 
                        icon={Users}
                    />
                )}
            </div>

            {activeQuery.isFetchingNextPage && (
                <TournamentLoading variant="inline" text="Loading more..." />
            )}
        </div>
    );
};
