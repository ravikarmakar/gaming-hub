import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import {
  getAllInvitations,
  inviteMemberInTeam,
} from "../../controllers/invitation.controller.js";

const router = Router();

router.get("/", isAuthenticated, getAllInvitations);
router.post("/invite-member", isAuthenticated, inviteMemberInTeam);

export default router;
