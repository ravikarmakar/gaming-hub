import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Check, User as UserIcon, Search, AlertCircle } from "lucide-react";

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
import { usePlayerStore } from "../../store/usePlayerStore";
import { User } from "@/features/auth/store/useAuthStore";

interface PlayerSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (members: string[]) => void;
  isLoading?: boolean;
  onInvite?: (playerId: string) => Promise<boolean>;
  invitedIds?: string[];
  existingMemberIds?: string[];
}

export const PlayerSearchCommand = ({
  open,
  onOpenChange,
  onSubmit,
  onInvite,
  invitedIds = [],
  isLoading,
  existingMemberIds = [],
}: PlayerSearchCommandProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localInvitedIds, setLocalInvitedIds] = useState<string[]>([]);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const { players, searchByUsername, isLoading: pending, error } = usePlayerStore();
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Memoized search function to prevent unnecessary re-renders
  const handleSearch = useCallback(
    async (term: string) => {
      if (term.trim().length === 0) {
        return;
      }
      await searchByUsername(term, 1, 50);
    },
    [searchByUsername]
  );

  // Effect to trigger search when debounced value changes
  useEffect(() => {
    if (open) {
      handleSearch(debouncedSearch);
    }
  }, [open, debouncedSearch, handleSearch]);

  // Toggle player selection
  const toggleSelection = useCallback((id: string) => {
    if (existingMemberIds.includes(id)) return;

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, [existingMemberIds]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedIds([]);
      // Clear previous search results for clean UX when reopening
      usePlayerStore.getState().clearPlayers();
    }
  }, [open]);

  // Handle individual invitation
  const handleInvite = useCallback(async (playerId: string) => {
    if (onInvite) {
      setInvitingId(playerId);
      const success = await onInvite(playerId);
      setInvitingId(null);
      if (success) {
        setLocalInvitedIds(prev => [...prev, playerId]);
        // Remove from selection if it was selected
        setSelectedIds(prev => prev.filter(id => id !== playerId));
        onOpenChange(false);
      }
    }
  }, [onInvite, onOpenChange]);

  // Handle batch invitation for selected players
  const handleBatchSubmit = useCallback(async () => {
    if (onInvite && selectedIds.length > 0) {
      // Invite each selected player
      for (const id of selectedIds) {
        await handleInvite(id);
      }
      setSearchTerm("");
      onOpenChange(false);
    } else if (onSubmit && selectedIds.length > 0) {
      onSubmit(selectedIds);
      setSearchTerm("");
      setSelectedIds([]);
      onOpenChange(false);
    }
  }, [selectedIds, onInvite, onSubmit, handleInvite, onOpenChange]);

  // Memoized player list to prevent unnecessary re-renders
  const playerList = useMemo(() => {
    return Array.isArray(players) ? players : [];
  }, [players]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 bg-[#0B0C1A] border-purple-500/20 shadow-2xl sm:max-w-[500px] max-w-[95vw]">
        <Command
          className="rounded-lg bg-transparent"
          onKeyDown={(e) => {
            // Prevent form submission when Enter is pressed on input field
            if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
        >
          <div className="relative">
            <CommandInput
              placeholder="Search players by username..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-12 pl-9 text-white placeholder:text-gray-500 border-0 focus:ring-0 bg-transparent"
            />
          </div>

          <CommandList className="max-h-[40vh] sm:max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
            {/* ... children ... */}
            <CommandEmpty className="py-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-400">
                  {searchTerm.trim().length === 0
                    ? "Type to search for players"
                    : "No players found"}
                </p>
              </div>
            </CommandEmpty>

            {error && (
              <div className="p-4 m-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <CommandGroup
              heading={
                searchTerm.trim()
                  ? `Results for "${searchTerm}"`
                  : "Start typing to search"
              }
              className="text-gray-400 [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
            >
              {pending ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-400" />
                  <p className="mt-2 text-sm text-gray-400">Searching players...</p>
                </div>
              ) : (
                playerList.length > 0 &&
                playerList.map((player: User) => {
                  if (!player?._id || !player?.username) return null;

                  const isSelected = selectedIds.includes(player._id);
                  const isInvited = invitedIds?.includes(player._id) || localInvitedIds.includes(player._id);
                  // Check if player is already in ANY team (via teamId from backend) or already in this team's list
                  const isAlreadyInTeam = !!player.teamId || existingMemberIds.includes(player._id);
                  const isInviting = invitingId === player._id;

                  return (
                    <CommandItem
                      key={player._id}
                      value={player.username}
                      onSelect={() => !isAlreadyInTeam && !isInvited && toggleSelection(player._id!)}
                      disabled={isAlreadyInTeam || isInvited}
                      className={`
                      px-3 py-3 mx-2 my-1 rounded-lg cursor-pointer
                      transition-all duration-200
                      hover:bg-white/5
                      data-[selected=true]:bg-white/5
                      ${isSelected ? "bg-purple-500/10 border border-purple-500/20" : "border border-transparent"}
                      ${isAlreadyInTeam || isInvited ? "opacity-50 cursor-not-allowed grayscale-[0.5]" : ""}
                    `}
                    >
                      <div className="flex items-center gap-3 w-full min-h-[44px]">
                        {/* Avatar */}
                        <Avatar className="w-9 h-9 border border-purple-500/20">
                          <AvatarImage src={player.avatar} alt={player.username} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-white text-sm">
                            {player.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {player.username}
                          </p>
                          {player.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {player.email}
                            </p>
                          )}
                        </div>

                        {/* Status Label */}
                        {isAlreadyInTeam ? (
                          <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 text-[10px] py-0 h-5">
                            In a Team
                          </Badge>
                        ) : isInvited ? (
                          <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-400 text-[10px] py-0 h-5">
                            Invited
                          </Badge>
                        ) : isInviting ? (
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        ) : isSelected && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })
              )}
            </CommandGroup>
          </CommandList>

          {/* Footer with Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-t border-purple-500/10 bg-[#0B0C1A]">
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/20 text-purple-400"
                >
                  <UserIcon className="w-3 h-3 mr-1" />
                  {selectedIds.length} selected
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none border-purple-500/20 hover:bg-purple-500/10 text-gray-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBatchSubmit}
                disabled={isLoading || selectedIds.length === 0 || !!invitingId}
                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || invitingId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {onInvite ? "Inviting..." : "Adding..."}
                  </>
                ) : (
                  `${onInvite ? "Invite" : "Add"} ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`
                )}
              </Button>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
