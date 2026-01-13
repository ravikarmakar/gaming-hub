import {
  Calendar,
  Users,
  Trophy,
  Eye,
  Heart,
  Clock,
  Flame,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@/features/events/store/useEventStore";

interface TournamentCardProps {
  event: Event;
  onCardClick?: (tournamentId: string) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  event,
  onCardClick,
}) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "registration-open":
        return "default";
      case "ongoing":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string): string => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleButtonClick = (): void => {
    if (onCardClick) {
      onCardClick(event._id);
    }
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 bg-gray-900 border-gray-800 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 group">
      {/* Image Header with Gradient */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-bold text-white/10 text-7xl">
            {event.game.substring(0, 2)}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            variant={getStatusVariant(event.status)}
            className="text-white bg-green-600 shadow-lg hover:bg-green-700"
          >
            {getStatusText(event.status)}
          </Badge>
        </div>

        {/* Trending Badge */}
        {event.trending && (
          <div className="absolute top-4 left-4">
            <Badge
              variant="destructive"
              className="text-white bg-orange-600 shadow-lg hover:bg-orange-700"
            >
              <Flame className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="secondary"
            className="text-xs text-white bg-purple-600 hover:bg-purple-700"
          >
            {event.game}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs text-blue-400 border-blue-500"
          >
            {event.category}
          </Badge>
        </div>
        <CardTitle className="text-2xl text-white">{event.title}</CardTitle>
        <CardDescription className="text-gray-400 line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prize Pool and Slots */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 space-y-1 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium">Prize Pool</span>
            </div>
            <p className="text-xl font-bold text-white">
              ${event.prizePool.toLocaleString()}
            </p>
          </div>

          <div className="p-3 space-y-1 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium">Slots</span>
            </div>
            <p className="text-xl font-bold text-white">{event.slots}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-green-500" />
            <span className="text-gray-400">Starts:</span>
            <span className="ml-auto font-medium text-white">
              {formatDate(event.startDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-gray-400">Reg. Ends:</span>
            <span className="ml-auto font-medium text-white">
              {formatDate(event.registrationEndsAt)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{event.likes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{event.views}</span>
          </div>
        </div>

        <Button
          onClick={handleButtonClick}
          className="text-white bg-purple-600 hover:bg-purple-700"
          size="sm"
          variant="outline"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Tournament Grid Component
interface TournamentGridProps {
  events: Event[];
  onButtonClick?: (tournamentId: string) => void;
}

export const TournamentGrid: React.FC<TournamentGridProps> = ({
  events,
  onButtonClick,
}) => {
  return (
    <div className="min-h-screen p-4 bg-gray-950 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Tournaments
          </h1>
          <p className="text-gray-400">
            Browse and join upcoming gaming tournaments
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <TournamentCard
              key={event._id}
              event={event}
              onCardClick={onButtonClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
