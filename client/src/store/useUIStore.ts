import { create } from "zustand";

interface UIState {
    activeSuppressionIds: Set<string>;
    isFooterSuppressed: boolean;
    suppressFooter: (id: string, suppress: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeSuppressionIds: new Set(),
    isFooterSuppressed: false,
    suppressFooter: (id, suppress) => set((state) => {
        const next = new Set(state.activeSuppressionIds);
        if (suppress) {
            next.add(id);
        } else {
            next.delete(id);
        }
        return { 
            activeSuppressionIds: next,
            isFooterSuppressed: next.size > 0
        };
    }),
}));
