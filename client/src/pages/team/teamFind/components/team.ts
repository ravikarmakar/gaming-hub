export interface TeamMember {
  id: string;
  name: string;
  role: string;
  rank: string;
  level: number;
  avatar: string;
}

export interface Team {
  id: string;
  name: string;
  region: string;
  rank: string;
  members: TeamMember[];
  recruitingRoles: string[];
  requirements: {
    minLevel: number;
    minRank: string;
    preferredRoles: string[];
  };
  active: boolean;
  lastActive: string;
}
