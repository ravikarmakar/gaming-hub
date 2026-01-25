import { SCOPES, Scope } from "./scopes";

export const SCOPE_ID_RESOLVER = {
    [SCOPES.TEAM]: (user) => user.teamId,
    [SCOPES.ORG]: (user) => user.orgId,
} as Partial<Record<Scope, (user: any) => string | undefined>>;
