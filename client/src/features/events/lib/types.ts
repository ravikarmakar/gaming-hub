export type RegistrationStatus = "registration-open" | "registration-closed" | "live";
export type EventProgress = "pending" | "ongoing" | "completed";
export type EventType = "scrims" | "tournament" | "invited-tournament";
export type Category = "solo" | "duo" | "squad";
export type RegistrationMode = "open" | "invite-only";

export interface RoadmapItem {
    name: string;
    title: string;
    isFinale?: boolean;
    isLeague?: boolean;
    leagueType?: "12-teams" | "18-teams";
    grandFinaleType?: string;
    groups?: string;
}

export interface Event {
    _id: string;
    title: string;
    game: string;
    eventType: EventType;
    category: Category;
    startDate: string;
    registrationEndsAt: string;
    maxSlots: number;
    joinedSlots: number;
    registrationMode: RegistrationMode;
    registrationStatus: RegistrationStatus;
    eventProgress: EventProgress;
    orgId: string;
    image?: string;
    description?: string;
    prizePool?: number;
    entryFee?: number;
    views?: number;
    likes?: number;
    trending?: boolean;
    eventEndAt?: string;
    slots?: number; // Adding slots for UI compatibility
    prizeDistribution?: Array<{ rank: number; amount: number; label?: string }>;
    location?: string; // Add location for UI compatibility
    roadmap?: RoadmapItem[];
    invitedTeams?: Array<{ teamName: string; email?: string }>;
    invitedTeamsRoadmap?: RoadmapItem[];
    createdAt?: string;
    updatedAt?: string;
    attendees?: number; // UI compatibility
}


