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

export interface TeamMembersTypes {
    _id: string;
    username: string;
    avatar: string;
    user: string;
    roleInTeam: typeof roleInTeam[number];
    systemRole: typeof systemRole[number];
    joinedAt: string;
    isActive: boolean;
}

export interface Team {
    _id: string;
    teamName: string;
    slug: string;
    tag: string;
    captain: string;
    teamMembers: TeamMembersTypes[];
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
