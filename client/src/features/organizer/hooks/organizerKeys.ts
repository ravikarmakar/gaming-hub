export const organizerKeys = {
    all: ['organizers'] as const,
    lists: () => [...organizerKeys.all, 'list'] as const,
    list: (filters: string) => [...organizerKeys.lists(), { filters }] as const,
    details: () => [...organizerKeys.all, 'detail'] as const,
    detail: (id: string) => [...organizerKeys.details(), id] as const,
};
