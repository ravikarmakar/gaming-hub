import { CustomError } from "../utils/CustomError.js";
import { Roles, Scopes } from "../constants/roles.js";
import mongoose from "mongoose";
import Team from "../../modules/team/team.model.js";
import Organizer from "../../modules/organizer/organizer.model.js";
import Event from "../../modules/event/event.model.js";
import Invitation from "../../modules/invitation/invitation.model.js";
import { logger } from "../utils/logger.js";

const SCOPE_MODELS = {
    [Scopes.ORG]: Organizer,
    [Scopes.TEAM]: Team,
    [Scopes.EVENT]: Event,
    [Scopes.INVITATION]: Invitation
};

/**
 * Industry-Standard Permission Matrix
 * Decouples code from specific roles.
 */
const PERMISSION_MATRIX = {
    [Scopes.TEAM]: {
        [Roles.TEAM.OWNER]: [
            "UPDATE_TEAM", "DELETE_TEAM", "MANAGE_STAFF", "TRANSFER_OWNERSHIP",
            "ADD_MEMBER", "REMOVE_MEMBER", "MANAGE_ROLES", "VIEW_REQUESTS", "HANDLE_REQUESTS"
        ],
        [Roles.TEAM.MANAGER]: [
            "UPDATE_TEAM", "ADD_MEMBER", "REMOVE_MEMBER", "MANAGE_ROLES",
            "VIEW_REQUESTS", "HANDLE_REQUESTS"
        ],
        [Roles.TEAM.PLAYER]: [
            "LEAVE_TEAM", "VIEW_TEAM"
        ]
    },
    [Scopes.ORG]: {
        [Roles.ORG.OWNER]: ["*"],
        [Roles.ORG.CO_OWNER]: ["*"],
        [Roles.ORG.MANAGER]: ["UPDATE_ORG", "MANAGE_STAFF", "INVITE_MEMBER"],
        // ... extend as needed
    }
};

// --- L1 Memory Cache for RBAC Resource Document Checks ---
const RBAC_CACHE_TTL = 60 * 1000; // 60 seconds
const RBAC_CACHE_MAX_SIZE = 500;
const rbacDocCache = new Map(); // Map<"scope:scopeId", { doc, expiry }>

// Periodic cleanup every 60 seconds
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rbacDocCache.entries()) {
        if (now > entry.expiry) {
            rbacDocCache.delete(key);
        }
    }
}, 60 * 1000);

/**
 * Invalidate cached RBAC documents for a specific resource.
 * Call this when a resource is deleted, soft-deleted, or significantly updated.
 */
export const invalidateRbacCache = (scope, scopeId) => {
    const key = `${scope}:${scopeId}`;
    rbacDocCache.delete(key);
};

/**
 * Get resource document with L1 cache.
 * Returns null if not found or deleted.
 */
const getCachedResourceDoc = async (scope, scopeId) => {
    const key = `${scope}:${scopeId}`;
    const now = Date.now();

    // Check L1 cache
    const cached = rbacDocCache.get(key);
    if (cached && cached.expiry > now) {
        return cached.doc;
    }

    // Cache miss — fetch from DB
    const model = SCOPE_MODELS[scope];
    if (!model) return undefined; // No model for this scope

    const doc = await model.findById(scopeId);

    if (doc && !doc.isDeleted) {
        // Evict oldest if cache is full
        if (rbacDocCache.size >= RBAC_CACHE_MAX_SIZE) {
            const firstKey = rbacDocCache.keys().next().value;
            rbacDocCache.delete(firstKey);
        }
        rbacDocCache.set(key, { doc, expiry: now + RBAC_CACHE_TTL });
        return doc;
    }

    // Resource not found or isDeleted — cache a null marker to avoid repeated DB hits
    rbacDocCache.set(key, { doc: null, expiry: now + RBAC_CACHE_TTL });
    return null;
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

            // 3. Platform Scope Check (Early Exit)
            if (scope === Scopes.PLATFORM) {
                if (isSuperAdmin) {
                    req.rbacContext = { isSuperAdmin: true, scope, role: Roles.PLATFORM.SUPER_ADMIN };
                    return next();
                }
                const platformRole = userRoles.find((r) => r.scope === Scopes.PLATFORM);
                if (!platformRole) return next(new CustomError("Access Denied: No platform role", 403));
                if (requiredRoles.length > 0 && !requiredRoles.includes(platformRole.role)) {
                    return next(new CustomError("Access Denied: Insufficient permissions", 403));
                }
                req.rbacContext = { scope, role: platformRole.role, isSuperAdmin: false };
                return next();
            }

            // 4. Resource ID Identification
            let scopeId = req.params[`${scope}Id`] || req.body[`${scope}Id`] || req.query[`${scope}Id`];
            if (!scopeId) {
                if (scope === Scopes.ORG) scopeId = req.params.orgId || req.body.orgId || req.query.orgId;
                if (scope === Scopes.TEAM) scopeId = req.params.teamId || req.body.teamId || req.query.teamId;
                if (scope === Scopes.EVENT) scopeId = req.params.eventId || req.body.eventId || req.query.eventId;
                if (scope === Scopes.INVITATION) scopeId = req.params.invitationId || req.body.invitationId || req.query.invitationId;
            }

            if (!scopeId) {
                console.log(`[RBAC] scopeId missing for ${scope}. Body:`, JSON.stringify(req.body));
                return next(new CustomError(`${scope} ID is required`, 400));
            }

            // 5. Validation & Document Handling (Common for all users)
            if (!mongoose.Types.ObjectId.isValid(scopeId)) {
                return next(new CustomError(`Invalid ${scope} ID format`, 400));
            }

            // Use L1 cached lookup instead of direct DB hit
            const resourceDoc = await getCachedResourceDoc(scope, scopeId);
            if (resourceDoc === null) {
                return next(new CustomError(`${scope} not found`, 404));
            }
            if (resourceDoc !== undefined && attachDoc) {
                req[`${scope}Doc`] = resourceDoc;
            }

            // 6. Super Admin Bypass (After document check for consistency)
            if (isSuperAdmin) {
                req.rbacContext = { isSuperAdmin: true, scope, scopeId, role: Roles.PLATFORM.SUPER_ADMIN };
                return next();
            }

            // 6.1 Invitation Basic Authorization (Receiver/Sender check)
            if (scope === Scopes.INVITATION && resourceDoc) {
                const currentUserId = req.user?.userId?.toString();
                if (!currentUserId) {
                    return next(new CustomError("Access Denied: specific user ID required", 403));
                }

                const isReceiver = resourceDoc.receiver?.toString() === currentUserId;
                const isSender = resourceDoc.sender?.toString() === currentUserId;

                if (!isReceiver && !isSender) {
                    return next(new CustomError("Access Denied: You are not authorized for this invitation", 403));
                }

                req.rbacContext = { scope, scopeId, isReceiver, isSender };
                return next();
            }

            // 7. Regular User Authorization logic
            let authorizedRole = userRoles.find(
                (r) => r.scope === scope && r.scopeId?.toString() === scopeId.toString()
            );

            // Check parent membership
            if (!authorizedRole && parentScope && resourceDoc) {
                const parentId = resourceDoc[`${parentScope}Id`];
                if (parentId) {
                    authorizedRole = userRoles.find(
                        (r) => r.scope === parentScope && r.scopeId?.toString() === parentId.toString()
                    );
                }
            }

            if (!authorizedRole) {
                return next(new CustomError(`Access Denied: Not a member of this ${scope}`, 403));
            }

            // 8. Permission Matrix Check
            const permissions = PERMISSION_MATRIX[scope]?.[authorizedRole.role] || [];

            // If requiredRoles is empty, membership is enough
            if (requiredRoles.length > 0) {
                const hasPermission = requiredRoles.some(roleReq =>
                    permissions.includes(roleReq) || permissions.includes("*")
                );

                if (!hasPermission) {
                    // Fallback: Legacy role support (if requiredRoles contains raw roles)
                    const isLegacyRoleMatch = requiredRoles.includes(authorizedRole.role);
                    if (!isLegacyRoleMatch) {
                        return next(new CustomError("Access Denied: Insufficient permissions", 403));
                    }
                }
            }

            req.rbacContext = { scope, scopeId, role: authorizedRole.role, isSuperAdmin: false };
            next();

        } catch (error) {
            logger.error(`[RBAC] Error in ${scope} authorization:`, error);
            next(new CustomError("Internal Server Error during authorization", 500));
        }
    };
};
