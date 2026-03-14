import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, ExternalLink, Loader2 } from "lucide-react";
import debounce from "lodash.debounce";
import { useInView } from "react-intersection-observer";
import { AutoSizer as _AutoSizer } from "react-virtualized-auto-sizer";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";

import { useGetInfiniteRegisteredTeamsQuery, useGetInfiniteInvitedTeamsQuery, useGetInfiniteT1SpecialTeamsQuery, useGetTournamentDetailsQuery } from "../../hooks/useTournamentQueries";

interface RegisteredTeamsListProps {
    eventId: string;
}

export const RegisteredTeamsList = ({ eventId }: RegisteredTeamsListProps) => {
    const navigate = useNavigate();
    const { data: event } = useGetTournamentDetailsQuery(eventId);
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
            <div className="p-6 border-b border-white/5 space-y-6 bg-gray-900/40">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full md:w-auto">
                        <TabsList className="bg-black/40 border border-white/10 p-1">
                            <TabsTrigger value="registered" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-6">
                                Registered
                            </TabsTrigger>
                            {event?.hasInvitedTeams && (
                                <TabsTrigger value="invited" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-6">
                                    Invited
                                </TabsTrigger>
                            )}
                            {event?.hasT1SpecialTeams && (
                                <TabsTrigger value="t1-special" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-6">
                                    T1 Special
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            <Input
                                placeholder="Search recruitment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:ring-purple-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Users className="w-3.5 h-3.5 text-purple-400" />
                            Loaded: {allTeams.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-black/20 w-full relative">
                {activeQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Assembling Squads...</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allTeams.map((team: any, idx: number) => {
                                if (!team) return null;
                                return (
                                    <div key={team._id || idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border border-white/10 shadow-lg">
                                            <AvatarImage src={team.imageUrl} />
                                            <AvatarFallback className="bg-purple-600/20 text-purple-300 font-bold">
                                                {team.teamName?.[0]?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white truncate">{team.teamName || 'Unknown Team'}</h4>
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
                        {activeQuery.isFetchingNextPage && (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                            </div>
                        )}
                        <div ref={ref} className="h-10" />
                    </div>
                )}
            </div>

            {activeQuery.isFetchingNextPage && (
                <div className="py-4 flex justify-center bg-gray-900/40 border-t border-white/5">
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin mr-2" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading more...</span>
                </div>
            )}
        </div>
    );
};
