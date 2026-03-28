export const TEAM_SOCKET_EVENTS = {
    // Room management
    JOIN_TEAM: "join:team",
    LEAVE_TEAM: "leave:team",

    // Member events
    MEMBER_JOINED: "team:member:joined",
    MEMBER_LEFT: "team:member:left",
    ROLE_UPDATED: "team:role:updated",
    OWNER_TRANSFERRED: "team:owner:transferred",

    // Team state events
    TEAM_UPDATED: "team:updated",
    TEAM_DELETED: "team:deleted",

    // Join request events
    JOIN_REQUEST_CREATED: "team:join_request:created",
    JOIN_REQUEST_HANDLED: "team:join_request:handled",
} as const;
