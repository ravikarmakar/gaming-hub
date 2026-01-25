import { Roles, User } from "../store/useAuthStore";

export function getRoleByScope(
    roles: Roles[] | undefined,
    scope: string
): Roles | undefined {
    if (!roles?.length) return undefined;

    return roles.find((r) => r.scope === scope);
}

export type AccessCheck = {
    scope: "platform" | "team" | "org";
    allowedRoles: readonly string[] | string[];
    scopeId?: string;
};

/**
 * Checks if a user has access based on provided criteria.
 */
export function hasAccess(user: User | null, check: AccessCheck): boolean {
    if (!user?.roles?.length) return false;

    return user.roles.some((r) => {
        if (r.scope !== check.scope) return false;

        if (!check.allowedRoles.includes(r.role)) return false;

        if (check.scope !== "platform" && check.scopeId) {
            return r.scopeId === check.scopeId;
        }

        return true;
    });
}

export const hasAnyRole = (
    user: User | null,
    scope: string,
    allowedRoles: readonly string[] | string[],
    orgId?: string
): boolean => {
    if (!user) return false;

    return user.roles?.some((r) => {
        const matchScope = r.scope === scope;
        const matchRole = allowedRoles.includes(r.role);
        const matchOrg = orgId ? r.scopeId === orgId : true;
        return matchScope && matchRole && matchOrg;
    });
};

export const hasOrgRole = (
    user: User | null,
    roles: readonly string[] | string[],
    orgId?: string
): boolean => {
    if (!user) return false;

    return user.roles.some(
        (r) =>
            roles.includes(r.role) &&
            r.scope === "org" &&
            (orgId ? r.scopeId === orgId : true)
    );
};

