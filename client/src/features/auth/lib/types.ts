// auth/access/types.ts
import type { Scope } from "./scopes";

export type AccessRule = {
    scope: Scope;
    roles: readonly string[];
    scopeId?: string;
};

export interface Roles {
    scope: "platform" | "org" | "team";
    role: string;
    scopeId: string;
    scopeModel: string;
}

export type EsportsRole = "player" | "sniper" | "support" | "igl" | "coach" | "rusher";

export interface User {
    _id?: string;
    username: string;
    email: string;
    avatar: string;
    coverImage?: string;
    region?: "na" | "eu" | "sea" | "sa" | "mea" | "global";
    country?: string;
    countryCode?: string;
    isLookingForTeam?: boolean;
    roles: Roles[];
    orgId: string;
    teamId: string;
    esportsRole: EsportsRole;
    canCreateOrg: boolean;
    isAccountVerified: boolean;
    isPlayerVerified: boolean;
    gameIgn?: string;
    gameUid?: string;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    dob?: string;
    phoneNumber?: string;
    settings?: {
        allowChallenges: boolean;
        allowMessages: boolean;
        notifications?: {
            platform: boolean;
            email: boolean;
            sms: boolean;
        };
    };
    verifyOtp: string;
    verifyOtpExpireAt: number;
    resetOtp: string;
    resetOtpExpireAt: number;
    createdAt: string;
    updatedAt: string;
    bio?: string;
    location?: string;
    socialLinks?: {
        discord?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        website?: string;
    };
    playerStats?: {
        level: number;
        xp: number;
        xpToNext: number;
        winRate: number;
        kdRatio: number;
        matchesPlayed: number;
        favoriteGame: string;
        highestRank: string;
        gameSpecificStats?: Array<{
            game: string;
            rank: string;
            rating: number;
            hoursPlayed: number;
            winRate: number;
            matches: number;
            kda: number;
            tier: string;
        }>;
    };
    achievements?: Array<{
        title: string;
        description: string;
        rarity: "common" | "rare" | "epic" | "legendary";
        unlockedAt?: string;
        progress?: number;
        maxProgress?: number;
    }>;
    equipment?: Array<{
        label: string;
        value: string;
        sub: string;
        category: string;
    }>;
}