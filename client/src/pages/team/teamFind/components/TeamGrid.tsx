import { TeamCard } from "./TeamCard";
import { Team } from "./team";

interface TeamGridProps {
  teams: Team[];
}

export function TeamGrid({ teams }: TeamGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {teams.map((team, index) => (
        <TeamCard key={team.id} team={team} index={index} />
      ))}
    </div>
  );
}
