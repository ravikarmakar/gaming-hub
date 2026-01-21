import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Trophy } from "lucide-react";

import { useEventStore } from "@/features/events/store/useEventStore";
import { TournamentGrid } from "@/features/organizer/ui/components/TournamentGrid";

const ViewAllEvents = () => {
  const navigate = useNavigate();

  const { isLoading, fetchAllEvents, events } = useEventStore();

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const onButtonClick = (eventId: string) => {
    navigate(`/organizer/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
          <p className="text-gray-400">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-950">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="mb-2 text-xl text-gray-400">No Tournaments Found</h3>
          <p className="text-gray-500">Check back later for upcoming events!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <h2 className="mb-6 text-3xl font-bold text-black">
        Best Tournaments For You
      </h2>

      <TournamentGrid events={events} onButtonClick={onButtonClick} />
    </div>
  );
};

export default ViewAllEvents;
