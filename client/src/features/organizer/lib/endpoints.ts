export const ORGANIZER_BASE = "/organizers";

export const ORGANIZER_ENDPOINTS = {
    CREATE_ORG: `${ORGANIZER_BASE}/create-org`,
    GET_ORG_DETAILS: (orgId: string) => `${ORGANIZER_BASE}/${orgId}`,
    GET_CURRENT_ORG: `${ORGANIZER_BASE}`,
    UPDATE_ORG: (orgId: string) => `${ORGANIZER_BASE}/${orgId}/update`,
    DELETE_ORG: (orgId: string) => `${ORGANIZER_BASE}/${orgId}/delete`,
    ADD_STAFF: (orgId: string) => `${ORGANIZER_BASE}/${orgId}/add-staff`,
    UPDATE_STAFF_ROLE: (orgId: string) => `${ORGANIZER_BASE}/${orgId}/update-staff-role`,
    REMOVE_STAFF: (orgId: string, staffId: string) => `${ORGANIZER_BASE}/${orgId}/remove-staff/${staffId}`,
    GET_DASHBOARD_STATS: `${ORGANIZER_BASE}/dashboard`,
    TRANSFER_OWNERSHIP: (orgId: string) => `${ORGANIZER_BASE}/${orgId}/transfer-ownership`,

    // Join Requests
    JOIN_ORG: (orgId: string) => `${ORGANIZER_BASE}/${orgId}/join`,
    GET_JOIN_REQUESTS: (orgId: string) => `${ORGANIZER_BASE}/${orgId}/join-requests`,
    MANAGE_JOIN_REQUEST: (orgId: string, requestId: string) => `${ORGANIZER_BASE}/${orgId}/join-requests/${requestId}`,

    // Notifications
    GET_NOTIFICATIONS: (orgId: string) => `/notifications/org/${orgId}`,
} as const;

export const PLAYER_ENDPOINTS = {
    SEARCH: "/players",
} as const;
