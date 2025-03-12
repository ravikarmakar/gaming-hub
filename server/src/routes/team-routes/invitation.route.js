import { Router } from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  getAllInvitations,
  acceptInvite,
  rejectInvite,
} from "../../controllers/team-controller/invitation.controller.js";

const router = Router();

router.get("/", protectRoute, getAllInvitations); // working
router.put("/accept/:invitationId", protectRoute, acceptInvite); // working
router.put("/reject/:invitationId", protectRoute, rejectInvite); // working

export default router;
