import { memo } from 'react';
import { MoreVertical, Edit2, Trash2, MessageSquare, UserPlus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Group } from "../../../hooks";

interface GroupCardProps {
    group: Group;
    roundMatches?: number;
    onSelect: (id: string) => void;
    onEdit: (group: Group) => void;
    onDelete: (group: Group) => void;
    onChat: (group: Group) => void;
    onInvite: (group: Group) => void;
    onMerge?: () => void;
    activeRoundTab?: string;
    round?: any;
}

export const GroupCard = memo(({ group, roundMatches, onSelect, onEdit, onDelete, onChat, onInvite, onMerge, activeRoundTab, round }: GroupCardProps) => {
    // Determine if merge option should be available
    // Determine if merge option should be available
    const hasMappings = round?.mergeInfo?.sources?.some((s: any) => s.hasTeamsToMerge);
    const isMainRoadmap = activeRoundTab === 'tournament';
    const showMerge = isMainRoadmap && hasMappings && group.status !== 'completed';
    return (
        <div
            onClick={() => onSelect(group._id)}
            className="bg-black/40 border border-white/5 p-4 rounded-xl hover:border-purple-500/30 transition-all duration-300 group cursor-pointer flex flex-col h-full shadow-lg hover:shadow-purple-500/5"
        >
            {/* Header: Row 1 - Name & Actions */}
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-gray-100 uppercase tracking-tight text-sm truncate pr-2">
                    {group.groupName}
                </h4>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Group actions"
                            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white min-w-[140px]">
                        <DropdownMenuItem
                            className="focus:bg-white/5 focus:text-white cursor-pointer py-2"
                            disabled={group.status === 'completed'}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(group);
                            }}
                        >
                            <Edit2 className="w-3.5 h-3.5 mr-2" />
                            <span className="text-xs">Edit Group</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem
                            className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400 py-2"
                            disabled={group.status === 'completed'}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(group);
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            <span className="text-xs">Delete Group</span>
                        </DropdownMenuItem>
                        {showMerge && (
                            <>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem
                                    className="focus:bg-indigo-500/10 focus:text-indigo-400 cursor-pointer py-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMerge?.();
                                    }}
                                >
                                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                    <span className="text-xs">Merge Qualified Teams</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Header: Row 2 - Status & Info */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-white/5 pb-3">
                {group.status === 'completed' ? (
                    <Badge className="text-[9px] h-4 px-1.5 bg-green-500/20 text-green-400 border-green-500/30 font-bold uppercase tracking-tighter">
                        Done
                    </Badge>
                ) : group.status === 'ongoing' ? (
                    <Badge className="text-[9px] h-4 px-1.5 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-bold uppercase tracking-tighter animate-pulse">
                        Live
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-gray-500 border-gray-700 font-bold uppercase tracking-tighter">
                        Pending
                    </Badge>
                )}

                {group.status === 'completed' && (
                    <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase tracking-tighter">
                        {group.totalSelectedTeam || 0} Qualified
                    </span>
                )}

                <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-white/5 text-gray-400 group-hover:bg-purple-500/10 group-hover:text-purple-300 transition-colors uppercase font-bold tracking-tighter">
                    {(group.teams || []).length} Teams
                </Badge>

                <Badge variant="outline" className="text-[9px] px-1.5 h-4 border-white/5 text-gray-500 font-bold uppercase tracking-tighter">
                    {group.matchesPlayed || 0}/{roundMatches || group.totalMatch} Matches
                </Badge>

                {group.matchTime && (
                    <div className="text-[9px] text-purple-400 font-black bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 ml-auto uppercase tracking-tighter">
                        {new Date(group.matchTime).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                )}
            </div>

            {/* Body: Teams List */}
            <div className="space-y-1.5 mb-auto">
                {group.teams?.slice(0, 3).map((team) => (
                    <div key={team._id} className="text-[11px] text-gray-500 flex items-center gap-2 group/team hover:text-gray-300 transition-colors">
                        <div className="w-1 h-1 rounded-full bg-gray-700 group-hover/team:bg-purple-500 transition-colors" />
                        <span className="truncate">{team.teamName}</span>
                    </div>
                ))}
                {(group.teams?.length || 0) > 3 && (
                    <div className="text-[10px] text-gray-500 pl-3 font-medium">
                        + {(group.teams?.length || 0) - 3} more teams
                    </div>
                )}
                {(!group.teams || group.teams.length === 0) && (
                    <div className="text-[10px] text-gray-600 italic pl-1">
                        No teams assigned
                    </div>
                )}
            </div>

            {/* Footer: Actions */}
            <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                <Button
                    size="sm"
                    className="w-full h-8 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/10 border-none uppercase tracking-wider"
                    onClick={(e) => {
                        e.stopPropagation();
                        onChat(group);
                    }}
                >
                    <MessageSquare className="w-3.5 h-3.5 mr-2" />
                    Group Chat
                </Button>

                {(!group.status || group.status !== 'completed') && (group.teams || []).length < (group.groupSize || 12) && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-[11px] font-bold border-purple-500/20 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/40 uppercase tracking-wider"
                        onClick={(e) => {
                            e.stopPropagation();
                            onInvite(group);
                        }}
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-2" />
                        Add Team
                    </Button>
                )}
            </div>
        </div>
    );
});

GroupCard.displayName = 'GroupCard';
