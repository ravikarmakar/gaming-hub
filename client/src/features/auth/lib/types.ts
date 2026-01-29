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
    roles: Roles[];
    orgId: string;
    teamId: string;
    esportsRole: EsportsRole;
    canCreateOrg: boolean;
    isAccountVerified: boolean;
    verifyOtp: string;
    verifyOtpExpireAt: number;
    resetOtp: string;
    resetOtpExpireAt: number;
    createdAt: string;
    updatedAt: string;
    bio?: string;
}