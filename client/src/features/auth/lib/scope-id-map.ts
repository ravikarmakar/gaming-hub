import { SCOPES, Scope } from "./scopes";

export const SCOPE_ID_RESOLVER = {
    [SCOPES.TEAM]: (user) => (typeof user.teamId === 'string' ? user.teamId : user.teamId?._id),
    [SCOPES.ORG]: (user) => (typeof user.orgId === 'string' ? user.orgId : user.orgId?._id),
    [SCOPES.SUPER_ADMIN]: (user) => user.id,
} as Partial<Record<Scope, (user: any) => string | undefined>>;