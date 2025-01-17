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
  avatar?: string | null;
  rank: number;
  role: "admin" | "max admin" | "user";
  blocked: boolean;
  globalRank: number;
  country?: string | null;
  device?: string | null;
  playstyle?: string | null;
  team?: string | null; // Assuming the team ID is a string
  game?: string;
  achievements: string[]; // Array of achievement IDs
  tournamentHistory: string[]; // Array of tournament IDs
  badges: Badge[];
  createdAt: string; // ISO 8601 formatted date string
  updatedAt: string; // ISO 8601 formatted date string
}
