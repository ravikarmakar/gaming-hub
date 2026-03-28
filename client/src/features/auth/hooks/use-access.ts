import { useCallback } from "react";
import { useParams } from "react-router-dom";

import { useCurrentUser } from "./use-current-user";
import { SCOPES } from "../lib/scopes";
import { SCOPE_ID_RESOLVER } from "../lib/scope-id-map";
import type { AccessRule } from "../types";

const SUPER_ADMIN_ROLE = "platform:superadmin";

export function useAccess() {
    const { user } = useCurrentUser();
    const params = useParams();

    const can = useCallback((rule: AccessRule): boolean => {
        if (!user) return false;

        // Super admin override (ONE PLACE)
        const isSuperAdmin = user.roles?.some(
            (r) =>
                r.scope === SCOPES.PLATFORM &&
                r.role === SUPER_ADMIN_ROLE
        );
        if (isSuperAdmin) return true;

        // Level-based check (if specified in the rule)
        if (rule.minLevel !== undefined) {
            const userLevel = user.playerStats?.level ?? 0;
            if (userLevel < rule.minLevel) return false;
        }

        // 10/10 Smart Context-Aware Resolution:
        // Automatically check URL params (e.g., :orgId, :teamId) if scopeId isn't provided.
        const resolvedScopeId =
            rule.scopeId ??
            params[`${rule.scope}Id`] ?? // Try standard param naming (e.g., teamId)
            params.id ?? // Fallback to common id param
            SCOPE_ID_RESOLVER[rule.scope]?.(user);

        return user.roles?.some((r) => {
            if (r.scope !== rule.scope) return false;
            if (!rule.roles.includes(r.role)) return false;

            // Convert to string for safe comparison (handling both String and ObjectId types)
            if (resolvedScopeId && r.scopeId?.toString() !== resolvedScopeId.toString()) return false;
            return true;
        }) ?? false;
    }, [user]);

    return { can };
}