export type Status = "registration-open" | "registration-closed" | "live" | "completed";
export type EventType = "scrims" | "tournament";
export type Category = "solo" | "duo" | "squad";
export type RegistrationMode = "open" | "invite-only";

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
    status: Status;
    orgId: string;
    image?: string;
    description?: string;
    prizePool?: number;
    views?: number;
    likes?: number;
    trending?: boolean;
    eventEndAt?: string;
    slots?: number; // Adding slots for UI compatibility
    prizeDistribution?: Array<{ rank: number; amount: number; label?: string }>;
    location?: string; // Add location for UI compatibility
    createdAt?: string;
    updatedAt?: string;
    attendees?: number; // UI compatibility
}


