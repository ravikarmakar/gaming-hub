export const EVENT_BASE = "/events";

export const EVENT_ENDPOINTS = {
    CREATE: `${EVENT_BASE}/create-event`,
    UPDATE: (id: string) => `${EVENT_BASE}/${id}`,
    DELETE: (id: string) => `${EVENT_BASE}/${id}`,
    ALL: `${EVENT_BASE}/all-events`,
    ORG_EVENTS: (orgId: string) => `${EVENT_BASE}/org-events/${orgId}`,
    DETAILS: (id: string) => `${EVENT_BASE}/event-details/${id}`,
    REGISTER: (id: string) => `${EVENT_BASE}/register-event/${id}`,
    IS_REGISTERED: (eventId: string, teamId: string) => `${EVENT_BASE}/is-registered/${eventId}/teams/${teamId}`,
    REGISTERED_TEAMS: (id: string) => `${EVENT_BASE}/registered-teams/${id}`,
    UNREGISTER: (id: string) => `${EVENT_BASE}/unregister/${id}`,
    CLOSE_REGISTRATION: (id: string) => `${EVENT_BASE}/close-registration/${id}`,
}