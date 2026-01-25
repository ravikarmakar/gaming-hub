import { useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { hasAccess, AccessCheck } from "../lib/permissions";

export const SCOPES = {
    PLATFORM: "platform",
    ORG: "org",
    TEAM: "team",
} as const;

export const SCOPE_ID_MAP = {
    [SCOPES.TEAM]: "teamId",
    [SCOPES.ORG]: "orgId",
} as const;

/**
 * Hook to check if the current user has access based on provided criteria.
 * Now dynamic and uses SCOPE_ID_MAP to resolve IDs.
 */
export function useHasAccess(check: AccessCheck): boolean {
    const { user } = useAuthStore();

    return useMemo(() => {
        const finalCheck = { ...check };

        // Dynamically resolve scopeId from user if not provided
        if (!finalCheck.scopeId && user) {
            const idKey = (SCOPE_ID_MAP as any)[finalCheck.scope];
            if (idKey && (user as any)[idKey]) {
                finalCheck.scopeId = (user as any)[idKey];
            }
        }

        return hasAccess(user, finalCheck);
    }, [user, check]);
}
