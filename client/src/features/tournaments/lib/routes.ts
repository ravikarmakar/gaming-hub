export const TOURNAMENT_ROUTES = {
    HUB: "/hub",
    TOURNAMENTS: "/tournaments",
    DETAILS: (id: string) => `/tournaments/${id}`,
    TOURNAMENT_DETAILS: "/tournaments/:id",
    DASHBOARD: (id: string) => `/tournaments/${id}/dashboard`,
} as const;
