import { ROUTE_PERMISSIONS } from "@/lib/roles";
import { User } from "@/features/auth/store/useAuthStore";

export const hasAnyRole = (
  user: User | null,
  scope: string,
  allowedRoles: string[],
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

export const hasRoutePermission = (
  user: User | null,
  routePath: RoutePath,
  orgId?: string
): boolean => {
  if (!user) return false;

  const allowedRoles = ROUTE_PERMISSIONS[routePath];
  if (!allowedRoles) return true; // no restriction

  return user.roles.some((r) => {
    const isAllowed = allowedRoles.includes(r.role);
    const isOrgValid = orgId ? r.scopeId === orgId : true;
    return isAllowed && isOrgValid;
  });
};

export const hasOrgRole = (
  user: User | null,
  roles: string[],
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

// working fine
export const isTeamOwner = (
  user: User | null,
  roles: { scope: string; role: string; scopeId?: string }[],
  teamId?: string
): boolean => {
  if (!user || !user.teamId) return false;

  const currentTeamId = teamId ?? user.teamId;

  return roles.some(
    (r) =>
      r.scope === "team" &&
      r.role === "team:owner" &&
      (!r.scopeId || r.scopeId === currentTeamId)
  );
};

type RoutePath = keyof typeof ROUTE_PERMISSIONS;
