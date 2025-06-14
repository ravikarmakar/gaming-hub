import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useDebounce } from "@/hooks/useDebounce";

import usePlayerStore from "../../store/usePlayerStore";
import { Member } from "@/store/useOrganizer";

export const PlayerSearchCommand = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (members: string[]) => void;
  isLoading?: boolean;
  members?: Member[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { players, searchByUsername, isLoading: pending } = usePlayerStore();
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (open) {
      searchByUsername(debouncedSearch, 1, 50);
    }
  }, [open, debouncedSearch, searchByUsername]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedIds([]);
    }
  }, [open]);

  if (!players) {
    return null;
  }

  const toggleSelection = (id: string) => {
    // if (isAlreadyMember(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedIds);
    setSearchTerm("");
    setSelectedIds([]);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md md:min-w-[450px]">
        <CommandInput
          placeholder="Members search..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup
            heading={searchTerm ? `Results for "${searchTerm}"` : "All Players"}
          >
            {pending ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              Array.isArray(players) &&
              players.length > 0 &&
              players.map(
                (player) =>
                  player &&
                  player._id &&
                  player.username && (
                    <CommandItem
                      key={player._id}
                      value={player.username}
                      onSelect={() => toggleSelection(player._id ?? "")}
                      className={
                        player._id && selectedIds.includes(player._id)
                          ? "bg-accent"
                          : ""
                      }
                    >
                      {player.username}
                    </CommandItem>
                  )
              )
            )}
          </CommandGroup>
        </CommandList>
        <div className="flex justify-end p-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedIds.length === 0}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isLoading ? "Adding Members.." : "Add Members"}
          </Button>
        </div>
      </Command>
    </CommandDialog>
  );
};
