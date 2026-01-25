import { SCOPES } from "@/features/auth/lib/scopes";

export const TEAM_ROLES = {
    OWNER: "team:owner",
    MANAGER: "team:manager",
    PLAYER: "team:player",
} as const;

export const TEAM_ACTIONS = {
    accessJoinRequestList: "team:accessJoinRequestList",
    acceptJoinRequest: "team:acceptJoinRequest",
    removeRoster: "team:removeRoster",
    updateMemberRole: "team:updateMemberRole",
    transferTeamOwnerShip: "team:transferTeamOwnerShip",
    rejectJoinRequest: "team:rejectJoinRequest",
    manageStaff: "team:manageStaff",
    manageRoster: "team:manageRoster",
    updateTeamSettings: "team:updateTeamSettings",
} as const;

export const TEAM_ACCESS = {
    dashboard: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER, TEAM_ROLES.PLAYER],
    },
    members: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER, TEAM_ROLES.PLAYER],
    },
    settings: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },
    staff: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER],
    },
};

export const TEAM_ACTIONS_ACCESS = {
    [TEAM_ACTIONS.accessJoinRequestList]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },
    [TEAM_ACTIONS.removeRoster]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },
    [TEAM_ACTIONS.transferTeamOwnerShip]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER],
    },
    [TEAM_ACTIONS.manageStaff]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER],
    },
    [TEAM_ACTIONS.acceptJoinRequest]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },
    [TEAM_ACTIONS.manageRoster]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },
    [TEAM_ACTIONS.updateMemberRole]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },

    [TEAM_ACTIONS.rejectJoinRequest]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },
    [TEAM_ACTIONS.updateTeamSettings]: {
        scope: SCOPES.TEAM,
        roles: [TEAM_ROLES.OWNER, TEAM_ROLES.MANAGER],
    },
};