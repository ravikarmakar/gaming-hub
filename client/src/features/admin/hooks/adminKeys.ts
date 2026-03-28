export const adminKeys = {
    all: ['admin'] as const,
    entities: (type: string) => ['admin', 'entities', type] as const,
    entityList: (type: string, filters: Record<string, any>) =>
        ['admin', 'entities', type, { filters }] as const,
};
