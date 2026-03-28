import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface UIContextValue {
    isFooterSuppressed: boolean;
    suppressFooter: (id: string, suppress: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeSuppressionIds, setActiveSuppressionIds] = useState<Set<string>>(new Set());

    const suppressFooter = useCallback((id: string, suppress: boolean) => {
        setActiveSuppressionIds((prev) => {
            const next = new Set(prev);
            if (suppress) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    const value = useMemo<UIContextValue>(() => ({
        isFooterSuppressed: activeSuppressionIds.size > 0,
        suppressFooter,
    }), [activeSuppressionIds, suppressFooter]);

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextValue => {
    const ctx = useContext(UIContext);
    if (!ctx) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return ctx;
};
