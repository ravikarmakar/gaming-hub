export const teamKeys = {
    all: ['teams'] as const,
    lists: () => [...teamKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...teamKeys.lists(), { filters }] as const,
    details: () => [...teamKeys.all, 'detail'] as const,
    detail: (id: string) => [...teamKeys.details(), id] as const,
    tournaments: (id: string) => [...teamKeys.detail(id), 'tournaments'] as const,
    requests: (id: string) => [...teamKeys.detail(id), 'join-requests'] as const,
    invites: (id: string) => [...teamKeys.detail(id), 'pending-invites'] as const,
};
