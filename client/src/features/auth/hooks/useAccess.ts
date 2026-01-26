import { useAuthStore } from "../store/useAuthStore";
import { SCOPES } from "../lib/scopes";
import { SCOPE_ID_RESOLVER } from "../lib/scopeIdMap";
import type { AccessRule } from "../lib/types";

const SUPER_ADMIN_ROLE = "platform:superadmin";

export function useAccess() {
    const { user } = useAuthStore();

    function can(rule: AccessRule): boolean {
        if (!user) return false;

        // Super admin override (ONE PLACE)
        const isSuperAdmin = user.roles?.some(
            (r) =>
                r.scope === SCOPES.PLATFORM &&
                r.role === SUPER_ADMIN_ROLE
        );
        if (isSuperAdmin) return true;

        const resolvedScopeId =
            rule.scopeId ??
            SCOPE_ID_RESOLVER[rule.scope]?.(user);

        return user.roles?.some((r) => {
            if (r.scope !== rule.scope) return false;
            if (!rule.roles.includes(r.role)) return false;

            // Convert to string for safe comparison (handling both String and ObjectId types)
            if (resolvedScopeId && r.scopeId?.toString() !== resolvedScopeId.toString()) return false;
            return true;
        }) ?? false;
    }

    return { can };
}
