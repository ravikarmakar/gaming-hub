export const playerKeys = {
    all: ['players'] as const,
    lists: () => [...playerKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...playerKeys.lists(), { filters }] as const,
    details: () => [...playerKeys.all, 'detail'] as const,
    detail: (id: string) => [...playerKeys.details(), id] as const,
};
