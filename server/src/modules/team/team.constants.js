// Team member role options (roleInTeam field)
export const TeamMemberRoles = {
    IGL: "igl",
    RUSHER: "rusher",
    SNIPER: "sniper",
    SUPPORT: "support",
    PLAYER: "player",
    COACH: "coach",
    ANALYST: "analyst",
    SUBSTITUTE: "substitute",
    MANAGER: "manager",
    CONTENT_CREATOR: "content_creator",
};

// Array of valid team member roles for validation
export const VALID_TEAM_MEMBER_ROLES = Object.values(TeamMemberRoles);
