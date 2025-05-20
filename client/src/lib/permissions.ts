import { ROUTE_PERMISSIONS } from "@/constants/roles";
import { User } from "@/store/useUserStore";

export const hasAnyRole = (
  user: User | null,
  scope: string,
  allowedRoles: string[],
  orgId?: string
): boolean => {
  if (!user) return false;

  return user.role?.some((r) => {
    const matchScope = r.scope === scope;
    const matchRole = allowedRoles.includes(r.role);
    const matchOrg = orgId ? r.orgId === orgId : true;
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

  return user.role.some((r) => {
    const isAllowed = allowedRoles.includes(r.role);
    const isOrgValid = orgId ? r.orgId === orgId : true;
    return isAllowed && isOrgValid;
  });
};

type RoutePath = keyof typeof ROUTE_PERMISSIONS;
