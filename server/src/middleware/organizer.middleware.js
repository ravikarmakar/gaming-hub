import { CustomError } from "../utils/CustomError.js";
import { Scopes, Roles } from "../constants/roles.js";

/**
 * Middleware to Guard Organization Access
 * Ensures the user has a specific role within the target organization.
 * 
 * @param {string[]} requiredRoles - Array of roles allowed to access (e.g., ['org:owner', 'org:manager'])
 * @returns {Function} Express middleware
 */
export const guardOrgAccess = (requiredRoles = []) => {
    return (req, res, next) => {
        try {
            // 1. Identify Organization ID
            // Prioritize route param :orgId, fallback to body.orgId
            const orgId = req.params.orgId || req.body.orgId;

            if (!orgId) {
                return next(new CustomError("Organization ID is required for this operation", 400));
            }

            // 2. Get User Roles (Fresh cached profile takes priority over JWT)
            const userRoles = req.user?.cachedProfile?.roles || req.user?.roles || [];

            // 3. Super Admin Override
            const isSuperAdmin = userRoles.some(
                (r) => r.scope === Scopes.PLATFORM && r.role === Roles.PLATFORM.SUPER_ADMIN
            );
            if (isSuperAdmin) {
                req.orgContext = { orgId, role: Roles.PLATFORM.SUPER_ADMIN, isSuperAdmin: true };
                return next();
            }

            // 4. Find the role specific to this Organization
            const orgRole = userRoles.find(
                (r) => r.scope === Scopes.ORG && r.scopeId?.toString() === orgId.toString()
            );

            if (!orgRole) {
                console.warn(`[guardOrgAccess] No role found for user ${req.user?._id} in org ${orgId}`);
                return next(new CustomError("Access Denied: You are not a member of this organization", 403));
            }

            // 5. Check if the user's role is in the allowed list
            if (requiredRoles.length > 0 && !requiredRoles.includes(orgRole.role)) {
                console.warn(`[guardOrgAccess] Insufficient permissions for user ${req.user?._id}. Have: ${orgRole.role}, Need one of: ${requiredRoles.join(', ')}`);
                return next(new CustomError("Access Denied: Insufficient permissions", 403));
            }

            // 6. Attach context for the controller
            req.orgContext = {
                orgId: orgId,
                role: orgRole.role
            };

            next();
        } catch (error) {
            console.error("RBAC Guard Error:", error);
            next(new CustomError("Internal Server Error during authorization", 500));
        }
    };
};
