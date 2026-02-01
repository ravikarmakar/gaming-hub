import { Router } from "express";
import {
  getAllInvitations,
  inviteMember,
  respondToInvitation,
} from "../controllers/invitation.controller.js";
import { authorize } from "../middleware/rbac.middleware.js";
import { Scopes, Roles } from "../constants/roles.js";
import { isAuthenticated, isVerified } from "../middleware/auth.middleware.js";

const router = Router();

router.use(isAuthenticated, isVerified);

router.get("/", getAllInvitations);

// Generic Invitation Handling
router.post("/invite", authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), inviteMember);
router.put("/:invitationId/respond", respondToInvitation);

export default router;
