export interface Badge {
  badgeName: string;
  criteria: string;
  awarded: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  termsAccepted: boolean;
  isOrganisation: boolean;
  avatar?: string;
  rank: number;
  role: "admin" | "max admin" | "user";
  blocked: boolean;
  globalRank: number;
  country?: string | null;
  device?: string | null;
  playstyle?: string | null;
  team?: string | null;
  game?: string;
  achievements: string[];
  tournamentHistory: string[];
  badges: Badge[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  game: string;
  startDate: string;
  mode: string;
  slots: string;
  time: string;
  location: string;
  category: string;
  venue: string;
  prize: string | null;
  image: string;
  description: string;
  attendees: number;
  status: string;
  registrationEnds: string;
  teams: [];
  rounds: [];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
