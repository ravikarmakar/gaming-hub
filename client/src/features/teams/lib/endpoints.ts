const TEAMS_BASE = "/teams";
const INVITATIONS_BASE = "/invitations";

export const TEAM_ENDPOINTS = {
    // Public
    GET_ALL: `${TEAMS_BASE}`,

    // Team CRUD
    GET_BY_ID: (teamId: string) => `${TEAMS_BASE}/details/${teamId}`,
    CREATE: `${TEAMS_BASE}/create-team`,
    UPDATE: `${TEAMS_BASE}/update-team`,
    DELETE: `${TEAMS_BASE}/delete-team`,

    // Members
    ADD_MEMBER: `${TEAMS_BASE}/add-members`,
    REMOVE_MEMBER: (memberId: string) =>
        `${TEAMS_BASE}/remove-member/${memberId}`,
    LEAVE_TEAM: `${TEAMS_BASE}/leave-member`,
    UPDATE_MEMBER_ROLE: `${TEAMS_BASE}/manage-member-role`,

    // Staff Management
    MANAGE_STAFF: `${TEAMS_BASE}/manage-staff-role`,

    // Ownership
    TRANSFER_OWNERSHIP: `${TEAMS_BASE}/transfer-owner`,

    // Invitations
    INVITE_MEMBER: `${INVITATIONS_BASE}/invite-member`,
    RESPOND_INVITE: `${INVITATIONS_BASE}/response-invite`,

    // Join Requests
    SEND_JOIN_REQUEST: (teamId: string) =>
        `${TEAMS_BASE}/${teamId}/join-request`,
    FETCH_JOIN_REQUESTS: `${TEAMS_BASE}/join-requests/all`,
    HANDLE_JOIN_REQUEST: (requestId: string) =>
        `${TEAMS_BASE}/join-requests/${requestId}`,
} as const;
