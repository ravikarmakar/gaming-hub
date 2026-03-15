import { memo } from 'react';
import { MoreVertical, Edit2, Trash2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Group } from "@/features/tournaments/types";

interface GroupActionsMenuProps {
    group: Group;
    onEdit: (group: Group) => void;
    onDelete: (group: Group) => void;
    onMerge?: () => void;
    showMerge?: boolean;
    align?: "start" | "end" | "center";
    className?: string;
    iconClassName?: string;
}

export const GroupActionsMenu = memo(({
    group,
    onEdit,
    onDelete,
    onMerge,
    showMerge = false,
    align = "end",
    className = "",
    iconClassName = "w-4 h-4"
}: GroupActionsMenuProps) => {
    if (!group) return null;

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Group actions"
                    className={`h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 transition-all ${className}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className={iconClassName} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="bg-gray-900 border-white/10 text-white min-w-[140px]">
                <DropdownMenuItem
                    className="focus:bg-white/5 focus:text-white cursor-pointer py-1.5"
                    disabled={group.status === 'completed'}
                    onSelect={(e) => {
                        e.preventDefault();
                        onEdit(group);
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Edit2 className="w-3.5 h-3.5 mr-2 opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider">Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                    className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500 py-1.5"
                    disabled={group.status === 'completed'}
                    onSelect={(e) => {
                        e.preventDefault();
                        onDelete(group);
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 className="w-3.5 h-3.5 mr-2 opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider">Delete</span>
                </DropdownMenuItem>
                {showMerge && (
                    <>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem
                            className="focus:bg-indigo-500/10 focus:text-indigo-400 cursor-pointer py-1.5"
                            onSelect={(e) => {
                                e.preventDefault();
                                onMerge?.();
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-2 opacity-50" />
                            <span className="text-xs font-medium uppercase tracking-wider">Merge</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

GroupActionsMenu.displayName = 'GroupActionsMenu';
