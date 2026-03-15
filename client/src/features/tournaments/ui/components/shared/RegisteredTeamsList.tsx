import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import debounce from "lodash.debounce";
import { useInView } from "react-intersection-observer";
import { AutoSizer as _AutoSizer } from "react-virtualized-auto-sizer";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";

import { useGetInfiniteRegisteredTeamsQuery, useGetInfiniteInvitedTeamsQuery, useGetInfiniteT1SpecialTeamsQuery, useGetTournamentDetailsQuery } from "@/features/tournaments/hooks/useTournamentQueries";

interface RegisteredTeamsListProps {
    eventId: string;
    showSearch?: boolean;
    showStats?: boolean;
    eventDetails?: any;
}

export const RegisteredTeamsList = ({
    eventId,
    showSearch = true,
    showStats = true,
    eventDetails: propEvent
}: RegisteredTeamsListProps) => {
    const navigate = useNavigate();
    const { data: fetchedEvent } = useGetTournamentDetailsQuery(eventId, {
        enabled: !propEvent
    });
    const event = propEvent || fetchedEvent;
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

    const registeredQuery = useGetInfiniteRegisteredTeamsQuery(eventId, debouncedSearch);
    const invitedQuery = useGetInfiniteInvitedTeamsQuery(eventId, debouncedSearch);
    const t1SpecialQuery = useGetInfiniteT1SpecialTeamsQuery(eventId, debouncedSearch);

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
        return activeQuery.data.pages.flatMap((page) => page?.teams || []) || [];
    }, [activeQuery.data]);

    return (
        <div className="flex flex-col" style={{ height: '700px', minWidth: '300px' }}>
            <div className="p-6 border border-white/5 rounded-2xl space-y-6 bg-gray-900/40 backdrop-blur-sm shadow-xl mb-6">
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
                                        placeholder="Search recruitment..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:ring-purple-500/20"
                                    />
                                </div>
                            )}
                            {showStats && (
                                <div className="flex items-center gap-2 px-0 h-10 bg-transparent text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Users className="w-3.5 h-3.5 text-purple-400" />
                                    Loaded: {allTeams.length}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-transparent w-full relative">
                {activeQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Assembling Squads...</p>
                    </div>
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
                    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
                        <div className="relative mb-8">
                            <div className="h-24 w-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center">
                                <Users className="w-10 h-10 text-gray-600" />
                            </div>
                            <div className="absolute -top-2 -right-2 h-10 w-10 rounded-2xl bg-rose-500 border border-white/20 flex items-center justify-center shadow-lg shadow-rose-500/40">
                                <ShieldAlert className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">
                            No Teams <span className="text-rose-500">Found</span>
                        </h3>
                    </div>
                )}
            </div>

            {activeQuery.isFetchingNextPage && (
                <div className="py-4 flex justify-center bg-transparent border-t border-white/5">
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin mr-2" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading more...</span>
                </div>
            )}
        </div>
    );
};
