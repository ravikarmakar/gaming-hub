import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Check, Search, AlertCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useDebounce } from "@/hooks/useDebounce";
import { useOrganizerStore } from "../../store/useOrganizerStore";
import { User } from "@/features/auth/store/useAuthStore";

interface OrganizerUserSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddSelected: (userIds: string[]) => Promise<void>;
    isLoading?: boolean;
    existingMemberIds?: string[];
}

export const OrganizerUserSearch = ({
    open,
    onOpenChange,
    onAddSelected,
    isLoading: isProcessing,
    existingMemberIds = [],
}: OrganizerUserSearchProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { availableUsers, searchAvailableUsers, isLoading, error, clearAvailableUsers } = useOrganizerStore();
    const debouncedSearch = useDebounce(searchTerm, 500);

    const handleSearch = useCallback(
        async (term: string) => {
            await searchAvailableUsers(term, 1, 50);
        },
        [searchAvailableUsers]
    );

    useEffect(() => {
        if (open) {
            handleSearch(debouncedSearch);
        }
    }, [open, debouncedSearch, handleSearch]);

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    }, []);

    useEffect(() => {
        if (!open) {
            setSearchTerm("");
            setSelectedIds([]);
            clearAvailableUsers();
        }
    }, [open, clearAvailableUsers]);

    const handleSubmit = async () => {
        if (selectedIds.length > 0) {
            await onAddSelected(selectedIds);
            onOpenChange(false);
        }
    };

    const userList = useMemo(() => {
        return Array.isArray(availableUsers) ? availableUsers : [];
    }, [availableUsers]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 bg-[#0a0514] border-purple-500/20 shadow-2xl sm:max-w-[500px] max-w-[95vw]">
                <Command className="rounded-lg bg-transparent">
                    <div className="relative border-b border-purple-500/10">
                        <CommandInput
                            placeholder="Find users not in any organization..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            className="h-12 pl-9 text-white placeholder:text-gray-500 border-0 focus:ring-0 bg-transparent"
                        />
                    </div>

                    <CommandList className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20">
                        <CommandEmpty className="py-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Search className="w-8 h-8 text-gray-700" />
                                <p className="text-sm text-gray-400">
                                    {searchTerm.trim().length === 0
                                        ? "Type to search for available users"
                                        : "No available users found"}
                                </p>
                            </div>
                        </CommandEmpty>

                        {error && (
                            <div className="p-4 m-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <CommandGroup heading="Available Users" className="text-gray-500">
                            {isLoading && userList.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-500" />
                                </div>
                            ) : (
                                userList.map((user: User) => {
                                    const isSelected = selectedIds.includes(user._id!);
                                    const isExisting = existingMemberIds.includes(user._id!);

                                    return (
                                        <CommandItem
                                            key={user._id}
                                            onSelect={() => !isExisting && toggleSelection(user._id!)}
                                            disabled={isExisting}
                                            className={`
                                                px-3 py-2 mx-2 my-1 rounded-lg cursor-pointer transition-all
                                                border border-transparent
                                                data-[selected='true']:bg-white/5
                                                ${isSelected ? "bg-purple-500/10 border-purple-500/20" : ""}
                                                ${isExisting ? "opacity-30 grayscale cursor-not-allowed" : ""}
                                            `}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <Avatar className="w-9 h-9 border border-purple-500/20">
                                                    <AvatarImage src={user.avatar} alt={user.username} />
                                                    <AvatarFallback className="bg-purple-500/10 text-purple-400">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{user.username}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                {isExisting ? (
                                                    <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-800">Member</Badge>
                                                ) : isSelected ? (
                                                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                ) : (
                                                    <Plus className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                        </CommandItem>
                                    );
                                })
                            )}
                        </CommandGroup>
                    </CommandList>

                    <div className="flex items-center justify-between p-4 border-t border-purple-500/10 bg-black/20">
                        <span className="text-xs text-gray-500">
                            {selectedIds.length} users selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={selectedIds.length === 0 || isProcessing}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Add to Org
                            </Button>
                        </div>
                    </div>
                </Command>
            </DialogContent>
        </Dialog>
    );
};
