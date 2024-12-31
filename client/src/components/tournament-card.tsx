import { Button } from "./elements/Button";
// import { Badge } from "@/components/ui/badge";
import { Users, Trophy } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import type { ACTIVE_TOURNAMENTS } from "@/lib/constants";
import { Card } from "./elements/Card";

type Tournament = (typeof ACTIVE_TOURNAMENTS)[number];

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-purple-500 transition-all duration-300">
      <div className="p-6">
        {/* <Badge className="mb-4 bg-purple-500">{tournament.status}</Badge> */}
        <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
        <div className="flex items-center gap-4 text-gray-400 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{tournament.participants}</span>
          </div>
          <div className="flex items-center">
            <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
            <span>${tournament.prizePool}</span>
          </div>
        </div>
        <CountdownTimer endDate={tournament.endDate} />

        {/* Action button */}
        <Button
          variant="secondary"
          className="w-full mt-4 group-hover:animate-pulse"
        >
          Register Now
        </Button>
      </div>
    </Card>
  );
}
