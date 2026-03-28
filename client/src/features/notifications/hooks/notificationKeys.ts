export const NOTIFICATIONS_KEYS = {
    all: ["notifications"] as const,
    lists: () => [...NOTIFICATIONS_KEYS.all, "list"] as const,
    list: (page: number) => [...NOTIFICATIONS_KEYS.lists(), { page }] as const,
    team: (teamId: string) => [...NOTIFICATIONS_KEYS.lists(), "team", teamId] as const,
    teamList: (teamId: string, page: number) => [...NOTIFICATIONS_KEYS.team(teamId), { page }] as const,
    unreadCount: () => [...NOTIFICATIONS_KEYS.all, "unread-count"] as const,
};
