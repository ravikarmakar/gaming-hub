import express from "express";
import {
    sendJoinRequest,
    getJoinRequests,
    handleJoinRequest,
    bulkRejectJoinRequests,
} from "./join-request.controller.js";
import { isAuthenticated, isVerified } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";
import { validateRequest } from "../../shared/middleware/validate.middleware.js";
import { rateLimiter } from "../../shared/middleware/rateLimiter.middleware.js";
import {
    manageJoinRequestValidation,
    bulkRejectJoinRequestsValidation,
} from "../team/team.validation.js";

const router = express.Router();

// Note: All routes are mounted at /api/v1/teams in app.js
// This provides a dedicated router for join-request operations

// Send join request to a team
router.post(
    "/:teamId/join-request",
    isAuthenticated,
    isVerified,
    rateLimiter({ limit: 5, timer: 60, key: "join-request" }),
    sendJoinRequest
);

// Get all join requests for a team (Manager/Owner only)
router.get(
    "/:teamId/join-requests/all",
    isAuthenticated,
    isVerified,
    authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }),
    getJoinRequests
);

// Handle (accept/reject) a specific join request
router.put(
    "/:teamId/join-requests/:requestId",
    isAuthenticated,
    isVerified,
    authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }),
    validateRequest(manageJoinRequestValidation),
    handleJoinRequest
);

// Bulk reject all pending join requests (Clear All)
router.delete(
    "/:teamId/join-requests/clear-all",
    isAuthenticated,
    isVerified,
    authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }),
    validateRequest(bulkRejectJoinRequestsValidation),
    bulkRejectJoinRequests
);

export default router;
