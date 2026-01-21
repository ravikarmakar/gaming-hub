import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useEventStore } from "@/features/events/store/useEventStore";

interface TeamListProps {
  eventId: string;
  setIsOpen: (isOpen: boolean) => void;
}

const TeamList = ({ eventId, setIsOpen }: TeamListProps) => {
  const { registerdTeams, fetchRegisteredTeams, isTeamsLoading } =
    useEventStore();

  useEffect(() => {
    fetchRegisteredTeams(eventId);
  }, [eventId, fetchRegisteredTeams]);

  if (isTeamsLoading) return <div className="text-white">Loading teams...</div>;

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Registered Teams</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-2">
        {registerdTeams?.length > 0 ? (
          registerdTeams.map((team) => (
            <div
              key={team._id}
              className="p-3 text-white transition-colors border border-gray-700 rounded bg-gray-800/50 hover:bg-gray-800"
            >
              {team.teamName}
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-gray-400">
            No teams registered yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamList;
