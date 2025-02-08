import PlayerCard from "./PlayerCard";
import { PlayerCardProps } from "./PlayerCard";

interface PlayerGridProps {
  teams: PlayerCardProps[];
}

export function TeamGrid({ players }: PlayerGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {players.map((player, index) => (
        <PlayerCard key={player.id} player={player} index={index} />
      ))}
    </div>
  );
}
