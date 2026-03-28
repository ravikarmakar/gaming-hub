export const chatKeys = {
    all: ['chat'] as const,
    history: (targetId: string, scope: string) =>
        [...chatKeys.all, 'history', targetId, scope] as const,
};
