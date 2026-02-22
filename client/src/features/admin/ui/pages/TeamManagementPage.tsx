import { useEffect, useState, useMemo } from "react";
import {
    MoreHorizontal,
    Search,
    UserCheck,
    UserMinus,
    ChevronLeft,
    ChevronRight,
    Users as UsersIcon,
    Ban,
    Trophy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useAdminStore } from "../../store/useAdminStore";
import { useDebounce } from "@/hooks/useDebounce";
import { throttle } from "@/lib/utils";
import { GlassCard, NeonBadge } from "@/features/events/ui/components/ThemedComponents";

import { cn } from "@/lib/utils";

const TeamManagementPage = () => {
    const {
        entities,
        isLoading,
        activeTab,
        currentPage,
        totalPages,
        pageSize,
        totalEntities,
        searchQuery,
        fetchEntities,
        setTab,
        setSearch,
        setPage,
        updateEntityStatus
    } = useAdminStore();

    // Local state for search to achieve debouncing
    const [searchTerm, setSearchTerm] = useState(searchQuery);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const teams = entities as any[]; // Type cast for simplicity in UI

    useEffect(() => {
        fetchEntities("Team", currentPage, activeTab, searchQuery);
    }, []);

    // Effect to sync debounced search with the store
    useEffect(() => {
        if (debouncedSearch !== searchQuery) {
            setSearch(debouncedSearch);
        }
    }, [debouncedSearch]);

    // Throttled actions to prevent API spam
    const throttledSetTab = useMemo(() => throttle((id: string) => setTab(id), 800), [setTab]);
    const throttledSetPage = useMemo(() => throttle((page: number) => setPage(page), 800), [setPage]);

    const tabs = [
        { id: "all", label: "All Teams", icon: UsersIcon },
        { id: "banned", label: "Banned", icon: Ban },
    ] as const;



    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="mb-2">
                        <NeonBadge variant="blue">Team Management</NeonBadge>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Arena Organizations</h1>
                    <p className="text-gray-400 mt-1 font-medium">Oversee competitive rosters and team standards.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search teams by name..."
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => throttledSetTab(tab.id)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border",
                                    isActive
                                        ? "bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                        : "bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-gray-300"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <GlassCard className="overflow-hidden border-white/5 p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.02]">
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest h-auto">Team Profile</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest h-auto">Created By</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest h-auto">Members</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest h-auto">Status</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right h-auto">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, i) => (
                                    <TableRow key={i} className="border-white/5 hover:bg-transparent">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-10 h-10 rounded-xl bg-white/5" />
                                                <Skeleton className="h-4 w-24 bg-white/5" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20 bg-white/5" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-6 w-16 bg-white/5 rounded-full" /></TableCell>
                                        <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 bg-white/5 rounded-md ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : teams.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableCell colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Trophy className="w-6 h-6 text-gray-700" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No teams found matching your criteria.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teams.map((team) => (
                                    <TableRow key={team._id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border border-white/10 rounded-xl">
                                                    <AvatarImage src={team.logo} />
                                                    <AvatarFallback className="bg-white/5 text-gray-400 font-bold uppercase text-xs rounded-xl">
                                                        {team.teamName}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {team.teamName}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">ID: {team._id.substring(0, 10)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-400 font-medium">
                                            {team.owner?.username || "Unknown"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-white font-mono">
                                            {team.members?.length || 0} Members
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {team.isBlocked ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                                                        <Ban className="w-3 h-3" />
                                                        Banned
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                                        Active
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#16161c] border-white/10 text-white shadow-2xl">
                                                    <DropdownMenuItem
                                                        className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer flex items-center gap-2 py-2.5 text-red-400"
                                                        onClick={() => updateEntityStatus("Team", team._id, { isBlocked: !team.isBlocked })}
                                                    >
                                                        {team.isBlocked ? (
                                                            <>
                                                                <UserCheck className="w-4 h-4" />
                                                                Unban Team
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserMinus className="w-4 h-4" />
                                                                Ban Team
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>


                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <p className="text-xs text-gray-500 font-medium">
                            Showing <span className="text-white">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-white">{Math.min(currentPage * pageSize, totalEntities)}</span> of <span className="text-white">{totalEntities}</span> teams
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1 || isLoading}
                                onClick={() => throttledSetPage(currentPage - 1)}
                                className="h-9 border-white/5 bg-transparent hover:bg-white/5 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => throttledSetPage(i + 1)}
                                        className={cn(
                                            "w-9 h-9 rounded-lg text-xs font-bold transition-all",
                                            currentPage === i + 1
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages || isLoading}
                                onClick={() => throttledSetPage(currentPage + 1)}
                                className="h-9 border-white/5 bg-transparent hover:bg-white/5 disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default TeamManagementPage;
