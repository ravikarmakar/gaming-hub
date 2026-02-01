import { CustomError } from "../utils/CustomError.js";
import { Roles, Scopes } from "../constants/roles.js";
import Team from "../models/team.model.js";
import Organizer from "../models/organizer.model.js";
import Event from "../models/event.model.js";
import { redis } from "../config/redis.js";

const SCOPE_MODELS = {
    [Scopes.ORG]: Organizer,
    [Scopes.TEAM]: Team,
    [Scopes.EVENT]: Event
};

/**
 * Centralized RBAC Middleware
 */
export const authorize = (scope, requiredRoles = [], options = {}) => {
    return async (req, res, next) => {
        try {
            const { attachDoc = false, parentScope = null } = options;

            // 1. Get User Roles
            const userRoles = req.user?.cachedProfile?.roles || req.user?.roles || [];

            // 2. Super Admin Override
            const isSuperAdmin = userRoles.some(
                (r) => r.scope === Scopes.PLATFORM && r.role === Roles.PLATFORM.SUPER_ADMIN
            );

            // 3. Resource ID Identification
            let scopeId = null;
            if (scope !== Scopes.PLATFORM) {
                scopeId = req.params[`${scope}Id`] || req.body[`${scope}Id`] || req.query[`${scope}Id`];

                if (!scopeId) {
                    if (scope === Scopes.ORG) scopeId = req.params.orgId || req.body.orgId;
                    if (scope === Scopes.TEAM) scopeId = req.params.teamId || req.body.teamId;
                    if (scope === Scopes.EVENT) scopeId = req.params.eventId || req.body.eventId;
                }

                if (!scopeId) {
                    if (scope === Scopes.TEAM) scopeId = req.user?.cachedProfile?.teamId || req.user?.teamId;
                    if (scope === Scopes.ORG) scopeId = req.user?.cachedProfile?.orgId || req.user?.orgId;
                }
            }


            // 4. Super Admin Bypass
            if (isSuperAdmin) {
                req.rbacContext = { isSuperAdmin: true, scope, scopeId, role: Roles.PLATFORM.SUPER_ADMIN };
                if (attachDoc && scopeId && SCOPE_MODELS[scope]) {
                    const doc = await SCOPE_MODELS[scope].findById(scopeId);
                    if (doc) req[`${scope}Doc`] = doc;
                }
                return next();
            }

            // 5. Platform Scope Check
            if (scope === Scopes.PLATFORM) {
                const platformRole = userRoles.find((r) => r.scope === Scopes.PLATFORM);
                if (!platformRole) return next(new CustomError("Access Denied: No platform role", 403));
                if (requiredRoles.length > 0 && !requiredRoles.includes(platformRole.role)) {
                    return next(new CustomError("Access Denied: Insufficient permissions", 403));
                }
                req.rbacContext = { scope, role: platformRole.role, isSuperAdmin: false };
                return next();
            }

            // 6. Resource Scope Check (including Parent Scope logic)
            if (!scopeId) {
                return next(new CustomError(`${scope} ID is required`, 400));
            }


            let resourceDoc = null;
            if (SCOPE_MODELS[scope]) {
                resourceDoc = await SCOPE_MODELS[scope].findById(scopeId);

                if (!resourceDoc || resourceDoc.isDeleted) {
                    return next(new CustomError(`${scope} not found`, 404));
                }
                if (attachDoc) req[`${scope}Doc`] = resourceDoc;
            }

            // Check direct membership
            let authorizedRole = userRoles.find(
                (r) => r.scope === scope && r.scopeId?.toString() === scopeId?.toString()
            );

            // Check parent membership
            if (!authorizedRole && parentScope && resourceDoc) {
                const parentId = resourceDoc.orgId || resourceDoc.teamId;

                if (parentId) {
                    authorizedRole = userRoles.find(
                        (r) => r.scope === parentScope && r.scopeId?.toString() === parentId.toString()
                    );
                }
            }


            if (!authorizedRole) {
                return next(new CustomError(`Access Denied: Not a member of this ${scope}`, 403));
            }

            if (requiredRoles.length > 0 && !requiredRoles.includes(authorizedRole.role)) {
                return next(new CustomError("Access Denied: Insufficient permissions", 403));
            }

            req.rbacContext = { scope, scopeId, role: authorizedRole.role, isSuperAdmin: false };
            next();

        } catch (error) {
            console.error(`[RBAC] Error in ${scope} authorizaton:`, error);
            next(new CustomError("Internal Server Error during authorization", 500));
        }
    };
};
