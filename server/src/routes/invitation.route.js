import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getAllInvitations,
  inviteMemberInTeam,
  respondToInvitation,
} from "../controllers/invitation.controller.js";

const router = Router();

router.get("/", isAuthenticated, getAllInvitations);
router.post("/invite-member", isAuthenticated, inviteMemberInTeam);
router.put("/:inviteId/respond", isAuthenticated, respondToInvitation);

export default router;
