import { Router } from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  getAllInvitations,
  acceptInvite,
} from "../../controllers/team-controller/invitation.controller.js";

const router = Router();

router.get("/", protectRoute, getAllInvitations);
router.post("/accept/:invitationId", protectRoute, acceptInvite);

export default router;
