import { useEffect } from "react";
import { Loader2, Trophy } from "lucide-react";

import { useEventStore } from "@/features/events/store/useEventStore";

import { TournamentGrid } from "../components/TournamentGrid";
import { useNavigate, useParams } from "react-router-dom";

const TournamentCard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchEventsByOrgId, isLoading, orgEvents } = useEventStore();

  useEffect(() => {
    if (id) {
      fetchEventsByOrgId(id);
    }
  }, [id, fetchEventsByOrgId]);

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

  if (orgEvents.length === 0) {
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

  return <TournamentGrid events={orgEvents} onButtonClick={onButtonClick} />;
};

export default TournamentCard;
