import { Event } from "@/features/events/lib/types";

export interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
}

export interface Organizer {
    _id?: string;
    ownerId: string;
    name: string;
    imageUrl: string;
    bannerUrl: string;
    description: string;
    region: string;
    members: Member[];
    isVerified: boolean;
    isHiring: boolean;
    tag: string;
    socialLinks?: {
        discord?: string;
        twitter?: string;
        website?: string;
        instagram?: string;
        youtube?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface DashboardStats {
    stats: {
        totalEvents: number;
        upcomingEvents: number;
        totalParticipants: number;
        totalPrizeMoney: number;
    };
    recentEvents: Event[];
    org: Organizer;
}

export interface Invite {
    _id: string;
    sender: {
        _id: string;
        username: string;
        avatar: string;
    };
    receiver: {
        _id: string;
        username: string;
        avatar: string;
    };
    role: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
    expiresAt: string;
}