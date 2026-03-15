export type RegistrationStatus = "registration-open" | "registration-closed" | "live";
export type TournamentProgress = "pending" | "ongoing" | "completed";
export type TournamentType = "scrims" | "tournament" | "invited-tournament" | "t1-special";
export type Category = "solo" | "duo" | "squad";
export type RegistrationMode = "open" | "invite-only";
export type RoadmapType = "tournament" | "invitedTeams" | "t1-special";

export interface RoadmapItem {
    name: string;
    title: string;
    isFinale?: boolean;
    isLeague?: boolean;
    leagueType?: "12-teams" | "18-teams";
    grandFinaleType?: string;
    groups?: string;
    roundId?: string;
    status?: string;
}

export interface Tournament {
    _id: string;
    title: string;
    game: string;
    eventType: TournamentType;
    isPaid?: boolean;
    category: Category;
    startDate: string;
    registrationEndsAt: string;
    maxSlots: number;
    joinedSlots: number;
    registrationMode: RegistrationMode;
    registrationStatus: RegistrationStatus;
    eventProgress: TournamentProgress;
    orgId: string;
    image?: string;
    description?: string;
    prizePool?: number;
    entryFee?: number;
    views?: number;
    likes?: number;
    trending?: boolean;
    isLiked?: boolean;
    eventEndAt?: string;
    slots?: number; // Adding slots for UI compatibility
    matchCount?: number;
    map?: string[];
    prizeDistribution?: Array<{ rank: number; amount: number; label?: string }>;
    location?: string; // Add location for UI compatibility
    roadmap?: RoadmapItem[];
    invitedTeams?: Array<{ teamName: string; email?: string; teamId?: string; _id?: string }>;
    maxInvitedSlots?: number;
    invitedTeamsRoadmap?: RoadmapItem[];
    invitedRoundMappings?: {
        startRound: number;
        endRound: number;
        targetMainRound: number;
    }[];
    t1SpecialRoundMappings?: {
        startRound: number;
        endRound: number;
        targetMainRound: number;
    }[];
    roadmaps?: Array<{ type: RoadmapType; data: RoadmapItem[] }>;
    hasInvitedTeams?: boolean;
    hasT1SpecialTeams?: boolean;
    registeredTeams?: string[];
    t1SpecialTeams?: string[];
    createdAt?: string;
    updatedAt?: string;
    attendees?: number; // UI compatibility
}

export interface Team {
    _id: string;
    teamName: string;
    teamLogo?: string;
    isQualified?: boolean;
    imageUrl?: string;
    tag?: string;
    teamMembers?: any[];
}

export interface LeaderboardEntry {
    _id: string;
    teamId: Team; // Populated
    score: number;
    position: number;
    kills: number;
    wins: number;
    totalPoints: number;
    matchesPlayed: number;
    isQualified: boolean;
}

export interface Leaderboard {
    _id: string;
    groupId: string;
    teamScore: LeaderboardEntry[];
}

export interface Group {
    _id: string;
    groupName: string;
    totalMatch: number;
    matchTime: string;
    teams: Team[];
    roundId: string;
    matchesPlayed?: number;
    totalSelectedTeam?: number;
    groupSize?: number;
    isLeague?: boolean;
    leaguePairingType?: "standard" | "axb-bxc-axc";
    status?: 'pending' | 'ongoing' | 'completed' | 'cancelled';
    roomId?: number;
    roomPassword?: number;
    eligibleTeams?: string[];
    pairingMatches?: {
        AxB: number;
        BxC: number;
        AxC: number;
    };
    subGroups?: Array<{
        _id: string;
        name: string; // "Sub-Group A", "Sub-Group B", "Sub-Group C"
        teams: (string | Team)[];
    }>;
}

export interface Round {
    _id: string;
    roundName: string;
    roundNumber: number;
    status: "pending" | "ongoing" | "completed";
    type?: "tournament" | "invited-tournament" | "t1-special";
    eventId: string;
    groups?: Group[];
    startTime?: string;
    dailyStartTime?: string;
    dailyEndTime?: string;
    gapMinutes?: number;
    matchesPerGroup?: number;
    qualifyingTeams?: number;
    groupSize?: number;
    isLeague?: boolean;
    leaguePairingType?: "standard" | "axb-bxc-axc";
    isPlaceholder?: boolean;
    roadmapIndex?: number;
    eligibleTeams?: string[];
    mergeInfo?: {
        sources: Array<{
            name: string;
            sourceRoundName?: string;
            type: string;
            pendingCount: number;
            mergedCount: number;
            isReady: boolean;
            hasTeamsToMerge: boolean;
        }>;
    } | null;
}
