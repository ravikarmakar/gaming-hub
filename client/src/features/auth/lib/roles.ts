export const SCOPES = {
    PLATFORM: "platform",
    ORG: "org",
    TEAM: "team",
} as const;


export const PLATFORM_ROLES = {
    SUPER_ADMIN: "platform:super_admin",
    STAFF: "platform:staff",
    USER: "platform:user",
} as const;

export const ORG_ROLES = {
    OWNER: "org:owner",
    MANAGER: "org:manager",
    STAFF: "org:staff",
    PLAYER: "org:player",
} as const;

export const PLATFORM_SUPER_ADMIN_ROLES = [
    PLATFORM_ROLES.SUPER_ADMIN,
    PLATFORM_ROLES.STAFF,
] as const;

export const ORG_ADMIN_ROLES = [
    ORG_ROLES.OWNER,
    ORG_ROLES.MANAGER,
    ORG_ROLES.STAFF,
] as const;
