import { User } from ".";

export interface TeamMember {
  userId: User;
  role: "player" | "substitute" | "rusher" | "sniper" | "support" | "captain";
}

export interface Team {
  _id: string;
  teamName: string;
  captain: string;
  owner: string;
  members: TeamMember[];
  maxPlayers: number;
  playedTournaments: string[];
  createdAt: string;
  updatedAt: string;
}
