import { Router } from "express";
import {
  getAllInvitations,
  inviteMember,
  respondToInvitation,
  getPendingInvitesForEntity
} from "./invitation.controller.js";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";
import { isAuthenticated, isVerified } from "../../shared/middleware/auth.middleware.js";
import { rateLimiter } from "../../shared/middleware/rateLimiter.middleware.js";

const router = Router();

router.use(isAuthenticated, isVerified);

router.get("/", getAllInvitations);

// Generic Invitation Handling
router.post(
  "/invite-member",
  rateLimiter({ limit: 5, timer: 60, key: "invite-member" }),
  authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]),
  inviteMember
);
router.put("/:invitationId/respond", authorize(Scopes.INVITATION, [], { attachDoc: true }), respondToInvitation);
router.get("/team/:teamId/pending", authorize(Scopes.TEAM, [Roles.TEAM.CAPTAIN, Roles.TEAM.MANAGER]), getPendingInvitesForEntity);

export default router;
