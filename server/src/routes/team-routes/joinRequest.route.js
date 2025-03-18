import { Router } from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  getAllJoinRequest,
  respondToJoinRequest,
  requestToJoinTeam,
} from "../../controllers/team-controller/joinRequest.controller.js";

const router = Router();

router.get("/", protectRoute, getAllJoinRequest);
router.put("/respond", protectRoute, respondToJoinRequest);
router.post("/", protectRoute, requestToJoinTeam);

export default router;
