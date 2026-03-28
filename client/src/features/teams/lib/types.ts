export const roleInTeam = [
    "igl",
    "rusher",
    "sniper",
    "support",
    "player",
    "coach",
    "analyst",
    "substitute",
];

export const systemRole = ["player", "owner", "manager"];

import { User } from "@/features/auth";
import { Organizer } from "@/features/organizer/types";

export interface TeamMember {
    _id: string;
    username: string;
    avatar: string;
    user: string | User;
    roleInTeam: typeof roleInTeam[number];
    systemRole: typeof systemRole[number];
    joinedAt: string;
    isActive: boolean;
}

export interface Pagination {
  totalCount: number;
  limit: number;
  currentPage: number;
  hasMore: boolean;
  page?: number;     // Keeping as optional for backward compatibility if needed
  pages?: number;    // Keeping as optional for backward compatibility if needed
}

export interface TeamTournament {
  _id: string;
  title: string;
  eventProgress: string;
  startDate: string;
  endDate?: string;
  prizePool: number;
  game: string;
  image?: string;
  eventType?: string;
  orgId?: {
    orgName: string;
    imageUrl?: string;
  };
}

export interface Team {
    _id: string;
    teamName: string;
    slug: string;
    tag: string;
    captain: string;
    teamMembers: TeamMember[];
    imageUrl: string | null;
    bannerUrl: string | null;
    bio: string;
    socialLinks?: {
        twitter?: string;
        discord?: string;
        youtube?: string;
        instagram?: string;
    };
    playedTournaments: {
        event: string;
        placement?: number;
        prizeWon: number;
        playedAt: string;
        status: "upcoming" | "ongoing" | "completed" | "eliminated";
        tournamentName?: string;
        title?: string;
    }[];
    matches?: {
        opponent: string;
        result: "win" | "loss" | "draw";
        score: string;
        date: string;
        map: string;
    }[];
    stats: {
        totalMatches: number;
        wins: number;
        losses: number;
        draws: number;
        tournamentWins: number;
        totalPrizeWon: number;
        winRate: number;
    };
    isVerified: boolean;
    isRecruiting: boolean;
    region: "NA" | "EU" | "ASIA" | "SEA" | "SA" | "OCE" | "MENA" | "INDIA" | null;
    game?: string;
    isDeleted: boolean;
    hasPendingRequest?: boolean;
    pendingRequestsCount?: number;
    type?: "team" | "org";
    createdAt: string;
    updatedAt: string;
}

export interface JoinRequest {
    _id: string;
    requester: User;
    target: string;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface TeamInvitation {
    _id: string;
    inviter: string | User;
    receiver: string | User;
    target: string | Team | Organizer;
    targetModel: 'Team' | 'Organization';
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TournamentItemProps {
    id: string;
    name: string;
    date: string;
    prize: string | number;
    status: "upcoming" | "ongoing" | "completed" | "eliminated";
    placement?: number;
    game?: string;
    image?: string;
    orgName?: string;
    orgImage?: string;
    type?: string;
}
