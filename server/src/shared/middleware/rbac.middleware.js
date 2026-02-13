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
                return next(new CustomError(`${scope} ID is required`, 400));
            }

            // 5. Validation & Document Handling (Common for all users)
            if (!mongoose.Types.ObjectId.isValid(scopeId)) {
                return next(new CustomError(`Invalid ${scope} ID format`, 400));
            }

            let resourceDoc = null;
            if (SCOPE_MODELS[scope]) {
                resourceDoc = await SCOPE_MODELS[scope].findById(scopeId);
                if (!resourceDoc || resourceDoc.isDeleted) {
                    return next(new CustomError(`${scope} not found`, 404));
                }
                if (attachDoc) req[`${scope}Doc`] = resourceDoc;
            }

            // 6. Super Admin Bypass (After document check for consistency)
            if (isSuperAdmin) {
                req.rbacContext = { isSuperAdmin: true, scope, scopeId, role: Roles.PLATFORM.SUPER_ADMIN };
                return next();
            }

            // 6.1 Invitation Basic Authorization (Receiver/Sender check)
            if (scope === Scopes.INVITATION && resourceDoc) {
                const currentUserId = req.user.userId.toString();
                const isReceiver = resourceDoc.receiver.toString() === currentUserId;
                const isSender = resourceDoc.sender.toString() === currentUserId;

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

            if (requiredRoles.length > 0 && !requiredRoles.includes(authorizedRole.role)) {
                return next(new CustomError("Access Denied: Insufficient permissions", 403));
            }

            req.rbacContext = { scope, scopeId, role: authorizedRole.role, isSuperAdmin: false };
            next();

        } catch (error) {
            logger.error(`[RBAC] Error in ${scope} authorization:`, error);
            next(new CustomError("Internal Server Error during authorization", 500));
        }
    };
};
