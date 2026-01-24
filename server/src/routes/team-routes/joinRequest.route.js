import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import {
  getAllJoinRequest,
  respondToJoinRequest,
  requestToJoinTeam,
} from "../../controllers/team-controller/joinRequest.controller.js";

const router = Router();

router.get("/", isAuthenticated, getAllJoinRequest);
router.put("/respond", isAuthenticated, respondToJoinRequest);
router.post("/", isAuthenticated, requestToJoinTeam);

export default router;
