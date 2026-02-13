import { Router } from "express";
import {
  getAllInvitations,
  inviteMember,
  respondToInvitation,
} from "./invitation.controller.js";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";
import { isAuthenticated, isVerified } from "../../shared/middleware/auth.middleware.js";

const router = Router();

router.use(isAuthenticated, isVerified);

router.get("/", getAllInvitations);

// Generic Invitation Handling
router.post("/invite-member", authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), inviteMember);
router.put("/:invitationId/respond", authorize(Scopes.INVITATION, [], { attachDoc: true }), respondToInvitation);

export default router;
