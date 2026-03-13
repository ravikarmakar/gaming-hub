export const organizerKeys = {
    all: ['organizers'] as const,
    lists: () => [...organizerKeys.all, 'list'] as const,
    list: (filters: any) => [...organizerKeys.lists(), { filters }] as const,
    details: () => [...organizerKeys.all, 'detail'] as const,
    detail: (id: string) => [...organizerKeys.details(), id] as const,
    dashboard: (id: string) => [...organizerKeys.detail(id), 'dashboard'] as const,
    invites: (id: string) => [...organizerKeys.detail(id), 'invites'] as const,
    requests: (id: string) => [...organizerKeys.detail(id), 'join-requests'] as const,
    notifications: (id: string) => [...organizerKeys.detail(id), 'notifications'] as const,
};
