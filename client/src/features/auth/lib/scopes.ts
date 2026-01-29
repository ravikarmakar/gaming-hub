export const SCOPES = {
    PLATFORM: "platform",
    ORG: "org",
    TEAM: "team",
    SUPER_ADMIN: "super_admin",
} as const;

export type Scope = typeof SCOPES[keyof typeof SCOPES];