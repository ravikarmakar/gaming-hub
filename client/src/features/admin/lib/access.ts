import { SCOPES } from "@/features/auth/lib/scopes";

export const ADMIN_ROLES = {
    SUPER_ADMIN: "platform:super_admin",
    STAFF: "platform:staff",
} as const;

export const ADMIN_ACCESS = {
    dashboard: {
        scope: SCOPES.PLATFORM,
        roles: [ADMIN_ROLES.SUPER_ADMIN],
    },
};
