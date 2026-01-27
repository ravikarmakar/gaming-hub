export const TEAM_BASE = "/dashboard/team";

export const TEAM_ROUTES = {
    DASHBOARD: TEAM_BASE,
    ALL_TEAMS: "/teams",
    PROFILE: "/team/:id",
    MEMBERS: `${TEAM_BASE}/members`,
    PERFORMANCE: `${TEAM_BASE}/performance`,
    TOURNAMENTS: `${TEAM_BASE}/tournaments`,
    NOTIFICATIONS: `${TEAM_BASE}/notifications`,
    SETTINGS: `${TEAM_BASE}/settings`,
    STAFF: `${TEAM_BASE}/staff`,
};
