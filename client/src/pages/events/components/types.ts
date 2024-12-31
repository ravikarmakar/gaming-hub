// export type EventStatus =
//   | "REGISTRATION_OPEN"
//   | "COMING_SOON"
//   | "REGISTRATION_CLOSED"
//   | "LIVE";

// export type EventStatus = "Upcoming" | "Ongoing" | "Completed";

export interface PrizeTier {
  position: string;
  prize: string;
}

export interface Event {
  id: number;
  title: string;
  image: string;
  game: string;
  registeredTeams: number;
  date: string;
  maxTeams: number;
  time: string; // e.g., "10:00 AM PST"
  location: string;
  description: string;
  status: string; // Use the EventStatus enum value// This should match the EventStatus type
  registrationEnds: string; // e.g., "2024-04-14"
  prizeTiers: PrizeTier[]; // Add this
}
