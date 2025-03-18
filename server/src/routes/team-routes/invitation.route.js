import { Router } from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  getAllInvitations,
  responseToInvite,
  inviteMemberInTeam,
} from "../../controllers/team-controller/invitation.controller.js";

const router = Router();

router.get("/", protectRoute, getAllInvitations);
router.post("/invite-member", protectRoute, inviteMemberInTeam);
router.put("/response-invite", protectRoute, responseToInvite);

export default router;
