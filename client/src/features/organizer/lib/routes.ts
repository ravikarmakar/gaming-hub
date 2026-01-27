export const ORGANIZER_BASE = "/dashboard/organizer";

export const ORGANIZER_ROUTES = {
    DASHBOARD: ORGANIZER_BASE,
    MEMBERS: `${ORGANIZER_BASE}/members`,
    TOURNAMENTS: `${ORGANIZER_BASE}/tournaments`,
    ADD_TOURNAMENTS: `${ORGANIZER_BASE}/add-tournaments`,
    EDIT_TOURNAMENT: `${ORGANIZER_BASE}/edit-tournament/:eventId`,
    ANALYTICS: `${ORGANIZER_BASE}/analytics`,
    NOTIFICATIONS: `${ORGANIZER_BASE}/notifications`,
    SETTINGS: `${ORGANIZER_BASE}/settings`,
    JOIN_REQUESTS: `${ORGANIZER_BASE}/join-requests`,
    PROFILE: "/organizer/:id",
} as const;