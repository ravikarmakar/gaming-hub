export const SCOPES = {
    PLATFORM: "platform",
    ORG: "org",
    TEAM: "team",
} as const;

export type Scope = typeof SCOPES[keyof typeof SCOPES];
