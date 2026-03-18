import { Plus, RefreshCw, Loader2, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RoundInfoTooltip } from "./RoundInfoTooltip";

interface RoundHeaderProps {
    round: any;
    activeRoundTab: string;
    isSavingStatus: boolean;
    isCreatingSingleGroup: boolean;
    isCreatingGroups: boolean;
    isMergingTeams?: boolean;
    cooldown: number;
    isCreateDisabled: boolean;
    onComplete: () => Promise<void>;
    onStart: () => void;
    onMergeTeams?: () => void;
    onCreateGroup: () => void;
    onRefresh: () => void;
    onCreateGroups: () => void;
    // Filter props (optional — header hides them for placeholder/completed rounds)
    search?: string;
    setSearch?: (v: string) => void;
    statusFilter?: string;
    setStatusFilter?: (v: string) => void;
    sortBy?: string;
    setSortBy?: (v: string) => void;
    onResetFilters?: () => void;
}

export const RoundHeader = ({
    round,
    activeRoundTab,
    isCreatingSingleGroup,
    isCreatingGroups,
    isMergingTeams,
    cooldown,
    isCreateDisabled,
    onStart,
    onMergeTeams,
    onCreateGroup,
    onRefresh,
    onCreateGroups,
    search = "",
    setSearch,
    statusFilter = "",
    setStatusFilter,
    sortBy = "matchTime-asc",
    setSortBy,
    onResetFilters,
}: RoundHeaderProps) => {
    const hasMappings = round.mergeInfo?.hasInvitedMapping || round.mergeInfo?.hasT1Mapping;
    const isMainRoadmap = activeRoundTab === 'tournament';
    const showFilters = !round.isPlaceholder && !!setSearch;
    const is18TeamLeague = round.roadmapData?.isLeague && round.roadmapData?.leagueType === '18-teams';

    const statusOptions = [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "ongoing", label: "Ongoing" },
        { value: "completed", label: "Done" },
    ];

    const sortOptions = [
        { value: "matchTime-asc", label: "Soonest" },
        { value: "matchTime-desc", label: "Latest" },
        { value: "name-asc", label: "Name A→Z" },
        { value: "name-desc", label: "Name Z→A" },
    ];

    return (
        <div className="h-14 px-4 flex items-center gap-2 border-b border-white/5 bg-black/10 overflow-hidden">

            {/* LEFT: Round name + status badges — fixed width, truncate long names */}
            <div className="flex items-center gap-2 shrink-0 min-w-0 max-w-[220px]">
                <div className="flex items-center gap-1.5 min-w-0">
                    <h2 className="text-sm font-black text-white uppercase tracking-tight leading-none truncate">
                        {round.roundName?.replace(/Round \d+ - /, '')}
                    </h2>
                    {!round.isPlaceholder && <RoundInfoTooltip round={round} />}
                </div>
                <Badge variant="secondary" className={`
                    shrink-0 text-[9px] h-4 px-1.5 font-black border uppercase tracking-tighter pointer-events-none
                    ${activeRoundTab === 'invited-tournament'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : activeRoundTab === 't1-special'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }
                `}>
                    {round.isPlaceholder ? "NOT STARTED" : activeRoundTab === 't1-special' ? "T1 SPECIAL" : round.status.toUpperCase()}
                </Badge>
                {(round.roadmapData?.isLeague || round.roadmapData?.isFinale) && (round.roadmapData?.leagueType || round.roadmapData?.grandFinaleType) && (
                    <Badge variant="outline" className="shrink-0 text-[9px] h-4 px-1.5 font-black border-white/10 text-gray-400 uppercase tracking-tighter pointer-events-none bg-white/5">
                        {(round.roadmapData?.leagueType || round.roadmapData?.grandFinaleType).replaceAll("-", " ")}
                    </Badge>
                )}
            </div>

            {/* Spacer — always pushes right-side content to the right */}
            <div className="flex-1" />

            {/* RIGHT: Filters + Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
                {/* Compact inline filters — only on active (non-placeholder, non-completed) rounds */}
                {showFilters && (
                    <div className="flex items-center gap-1.5 mr-2">
                        {/* Search input */}
                        <div className="relative w-48 shrink-0">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                            <Input
                                placeholder="Search groups…"
                                value={search}
                                onChange={(e) => setSearch?.(e.target.value)}
                                className="h-6 pl-6 pr-2 text-[11px] bg-purple-950/40 border-purple-500/20 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-purple-500/50 rounded-md"
                            />
                        </div>

                        {/* Status filter */}
                        <Select
                            value={statusFilter || "all"}
                            onValueChange={(v) => setStatusFilter?.(v === "all" ? "" : v)}
                        >
                            <SelectTrigger className="h-6 w-[84px] shrink-0 text-[11px] font-semibold bg-purple-950/40 border-purple-500/20 text-purple-200 focus:ring-0 rounded-md px-2 gap-1">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a0a2e] border-purple-500/20 text-xs text-purple-200">
                                {statusOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value} className="text-purple-200 focus:bg-purple-800/40 focus:text-white">
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(v) => setSortBy?.(v)}>
                            <SelectTrigger className="h-6 w-[96px] shrink-0 text-[11px] font-semibold bg-purple-950/40 border-purple-500/20 text-purple-200 focus:ring-0 rounded-md px-2 gap-1">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a0a2e] border-purple-500/20 text-xs text-purple-200">
                                {sortOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value} className="text-purple-200 focus:bg-purple-800/40 focus:text-white">
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Reset Filter Button */}
                        {(search || statusFilter || sortBy !== "matchTime-asc") && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onResetFilters?.()}
                                title="Reset Filters"
                                aria-label="Reset Filters"
                                className="h-6 w-6 p-0 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-md transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                )}
                {/* Progress pill — hidden if round is completed */}
                {!round.isPlaceholder && round.status !== 'completed' && (
                    <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest hidden sm:inline">Progress</span>
                        <span className="text-xs font-black text-white">
                            {(round.groups || []).filter((g: any) => g.status === 'completed').length}
                            <span className="text-gray-600 mx-0.5">/</span>
                            {(round.groups || []).length}
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tight hidden sm:inline">Groups</span>
                    </div>
                )}

                {round.isPlaceholder ? (
                    <Button
                        size="sm"
                        onClick={onStart}
                        disabled={isCreateDisabled}
                        className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wide px-3"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Start Round
                    </Button>
                ) : (
                    <div className="flex items-center gap-1">
                        {round.status === 'completed' ? (
                            <div className="flex items-center gap-3 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-xl">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Groups</p>
                                    <p className="text-sm font-black text-white leading-none">{(round.groups || []).length}</p>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[9px] text-purple-400 uppercase font-black tracking-widest">Qualified</p>
                                    <p className="text-sm font-black text-purple-400 leading-none drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]">
                                        {(round.groups || []).reduce((acc: number, g: any) => acc + (g.totalSelectedTeam || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {isMainRoadmap && hasMappings && round.status === 'pending' && (!round.groups || round.groups.length === 0) && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onMergeTeams?.()}
                                        disabled={isMergingTeams}
                                        className="h-7 text-xs font-bold border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3"
                                    >
                                        {isMergingTeams ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
                                        Merge
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    onClick={() => {
                                        if (is18TeamLeague) {
                                            onCreateGroup(); // This will trigger the dialog which then calls handleManualCreateGroup
                                        } else {
                                            onCreateGroup();
                                        }
                                    }}
                                    disabled={isCreatingSingleGroup}
                                    title={is18TeamLeague ? "Create League Group" : "Create One Manual Group"}
                                    aria-label={is18TeamLeague ? "Create League Group" : "Create Manual Group"}
                                    className={`h-7 transition-all duration-300 ${is18TeamLeague ? 'px-3 w-auto bg-purple-600/20 text-purple-400 border-purple-500/30 font-bold text-[10px] uppercase tracking-wider' : 'w-7 p-0 bg-transparent text-gray-400 hover:bg-purple-600/20 hover:text-purple-400 border border-white/5 hover:border-purple-500/30'} disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400`}
                                >
                                    {isCreatingSingleGroup ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            {is18TeamLeague && "Create League"}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={onRefresh}
                                    disabled={cooldown > 0}
                                    title="Refresh"
                                    className={`
                                        h-7 w-7 p-0 transition-all duration-300
                                        ${cooldown > 0
                                            ? 'bg-purple-900/20 text-purple-400 border border-purple-500/10'
                                            : 'bg-transparent text-gray-400 hover:bg-purple-600/20 hover:text-purple-400 border border-white/5 hover:border-purple-500/30'
                                        }
                                    `}
                                >
                                    {cooldown > 0 ? (
                                        <span className="flex items-center justify-center text-[11px] font-black">{cooldown}</span>
                                    ) : (
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    )}
                                </Button>

                                {!is18TeamLeague && (!round.groups || round.groups.length === 0) && (
                                    <Button
                                        size="sm"
                                        onClick={onCreateGroups}
                                        disabled={isCreatingGroups}
                                        className={`h-7 text-xs font-bold ${activeRoundTab === 'invited-tournament' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-3`}
                                    >
                                        {isCreatingGroups ? (
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        ) : (
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                        )}
                                        Create Groups
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
