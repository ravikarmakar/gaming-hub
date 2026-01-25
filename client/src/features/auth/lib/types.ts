// auth/access/types.ts
import type { Scope } from "./scopes";

export type AccessRule = {
    scope: Scope;
    roles: readonly string[];
    scopeId?: string;
};
