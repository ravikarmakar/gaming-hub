import { useAuthStore } from "../store/useAuthStore";
import { hasAnyRole } from "../lib/permissions";
import { SCOPES, ORG_ADMIN_ROLES, PLATFORM_SUPER_ADMIN_ROLES } from "../lib/roles";
import { TEAM_ROLES, TEAM_SCOPES } from "@/features/teams/lib/access";

export const usePermissions = () => {
    const { user } = useAuthStore();

    /**
     * General purpose check for any role in a scope
     */
    const can = (
        scope: string,
        allowedRoles: string[],
        scopeId?: string
    ) => {
        return hasAnyRole(user, scope, allowedRoles, scopeId);
    };

    /**
     * Check if user has access to a specific organization
     */
    const hasOrgAccess = (orgId?: string) => {
        // By default check for Admin roles (Owner, Manager, Staff)
        // If specific roles are needed, use 'can' or extend this function arguments
        return hasAnyRole(user, SCOPES.ORG, ORG_ADMIN_ROLES, orgId);
    };

    /**
     * Check if user is a Super Admin
     */
    const isSuperAdmin = () => {
        return hasAnyRole(user, SCOPES.PLATFORM, PLATFORM_SUPER_ADMIN_ROLES);
    };

    /**
     * Check if user is owner of the current team
     */
    const isTeamCaptain = (teamId?: string) => {
        return hasAnyRole(user, TEAM_SCOPES.TEAM, [TEAM_ROLES.MANAGER, TEAM_ROLES.OWNER], teamId);
    };

    return {
        user,
        can,
        hasOrgAccess,
        isSuperAdmin,
        isTeamCaptain,
    };
};
