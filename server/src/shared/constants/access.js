import { Roles } from "./roles.js";

export const TEAM_ACTIONS = {
    acceptJoinRequest: "team:acceptJoinRequest",
    rejectJoinRequest: "team:rejectJoinRequest",
    removeMember: "team:removeMember",
    updateMemberRole: "team:updateMemberRole",
    transferTeamOwnerShip: "team:transferTeamOwnerShip",
    manageStaff: "team:manageStaff",
    manageRoster: "team:manageRoster",
    updateTeamSettings: "team:updateTeamSettings",
};

export const TEAM_ACTIONS_ACCESS = {
    [TEAM_ACTIONS.acceptJoinRequest]: [Roles.TEAM.OWNER, Roles.TEAM.MANAGER],
    [TEAM_ACTIONS.rejectJoinRequest]: [Roles.TEAM.OWNER, Roles.TEAM.MANAGER],
    [TEAM_ACTIONS.removeMember]: [Roles.TEAM.OWNER, Roles.TEAM.MANAGER],
    [TEAM_ACTIONS.updateMemberRole]: [Roles.TEAM.OWNER, Roles.TEAM.MANAGER],
    [TEAM_ACTIONS.transferTeamOwnerShip]: [Roles.TEAM.OWNER],
    [TEAM_ACTIONS.manageStaff]: [Roles.TEAM.OWNER],
    [TEAM_ACTIONS.manageRoster]: [Roles.TEAM.OWNER, Roles.TEAM.MANAGER],
    [TEAM_ACTIONS.updateTeamSettings]: [Roles.TEAM.OWNER, Roles.TEAM.MANAGER],
};
