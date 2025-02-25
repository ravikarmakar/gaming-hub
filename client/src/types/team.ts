export interface TeamMember {
  userId: string;
  role: "player" | "substitute" | "rusher" | "sniper" | "support" | "captain";
}

export interface Team {
  _id: string;
  teamName: string;
  captain: string;
  members: TeamMember[];
  maxPlayers: number;
  playedTournaments: string[];
  createdAt: string;
  updatedAt: string;
}
