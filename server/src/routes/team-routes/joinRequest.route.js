import { Router } from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  getAllJoinRequest,
  respondToJoinRequest,
} from "../../controllers/team-controller/joinRequest.controller.js";

const router = Router();

router.get("/", protectRoute, getAllJoinRequest);
router.put("/:requestedId", protectRoute, respondToJoinRequest);

export default router;
