export const TOURNAMENT_BASE = "/events"; // Keeping /events for backend compatibility

export const TOURNAMENT_ENDPOINTS = {
    CREATE: `${TOURNAMENT_BASE}/create-event`,
    UPDATE: (id: string) => `${TOURNAMENT_BASE}/${id}`,
    DELETE: (id: string) => `${TOURNAMENT_BASE}/${id}`,
    ALL: `${TOURNAMENT_BASE}/all-events`,
    ORG_EVENTS: (orgId: string) => `${TOURNAMENT_BASE}/org-events/${orgId}`,
    DETAILS: (id: string) => `${TOURNAMENT_BASE}/event-details/${id}`,
    REGISTER: (id: string) => `${TOURNAMENT_BASE}/register-event/${id}`,
    IS_REGISTERED: (eventId: string, teamId: string) => `${TOURNAMENT_BASE}/is-registered/${eventId}/teams/${teamId}`,
    REGISTERED_TEAMS: (id: string) => `${TOURNAMENT_BASE}/registered-teams/${id}`,
    INVITED_TEAMS: (id: string) => `${TOURNAMENT_BASE}/invited-teams/${id}`,
    UNREGISTER: (id: string) => `${TOURNAMENT_BASE}/unregister/${id}`,
    CLOSE_REGISTRATION: (id: string) => `${TOURNAMENT_BASE}/close-registration/${id}`,
    TEAM_TOURNAMENTS: (teamId: string) => `${TOURNAMENT_BASE}/team-events/${teamId}`,
}
