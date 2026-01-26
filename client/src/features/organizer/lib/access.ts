import { SCOPES } from "@/features/auth/lib/scopes";
export const ORG_SCOPES = SCOPES;

export const ORG_ROLE = {
    OWNER: "org:owner",
    CO_OWNER: "org:co_owner",
    MANAGER: "org:manager",
    STAFF: "org:staff",
    PLAYER: "org:player",
} as const;

export const ORG_ACCESS = {
    dashboard: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER, ORG_ROLE.STAFF, ORG_ROLE.PLAYER],
    },
    members: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER, ORG_ROLE.STAFF, ORG_ROLE.PLAYER],
    },
    tournaments: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER, ORG_ROLE.STAFF, ORG_ROLE.PLAYER],
    },
    createTournament: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
    joinRequests: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER],
    },
    analytics: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
    notifications: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER, ORG_ROLE.STAFF, ORG_ROLE.PLAYER],
    },
    settings: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
};

export const ORG_ROUTE_ACCESS = {
    dashboard: ORG_ACCESS.dashboard,
    members: ORG_ACCESS.members,
    joinRequests: ORG_ACCESS.joinRequests,
    createTournament: ORG_ACCESS.createTournament,
    tournaments: ORG_ACCESS.tournaments,
    analytics: ORG_ACCESS.analytics,
    notifications: ORG_ACCESS.notifications,
    settings: ORG_ACCESS.settings,
}

export const ORG_ACTIONS = {
    inviteMember: "inviteMember",
    removeMember: "removeMember",
    updateRole: "updateRole",
    viewAnalytics: "viewAnalytics",
    viewDashboardButton: "viewDashboardButton",
    updateOrg: "updateOrg",
    deleteOrg: "deleteOrg",
    transferOwnership: "transferOwnership",
} as const;

export const ORG_ACTIONS_ACCESS = {
    [ORG_ACTIONS.viewDashboardButton]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER, ORG_ROLE.STAFF, ORG_ROLE.PLAYER],
    },
    [ORG_ACTIONS.inviteMember]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
    [ORG_ACTIONS.removeMember]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
    [ORG_ACTIONS.updateRole]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
    [ORG_ACTIONS.viewAnalytics]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
    [ORG_ACTIONS.updateOrg]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER, ORG_ROLE.CO_OWNER, ORG_ROLE.MANAGER],
    },
    [ORG_ACTIONS.deleteOrg]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER],
    },
    [ORG_ACTIONS.transferOwnership]: {
        scope: SCOPES.ORG,
        roles: [ORG_ROLE.OWNER],
    },
};