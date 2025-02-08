import express from "express";
import {
  createTeams,
  getAllTeams,
  invitePlayer,
  acceptInvite,
  requestToJoinTeam,
} from "../controllers/team.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllTeams);
router.post("/create", protectRoute, createTeams);
router.post("/:teamId", protectRoute, invitePlayer);

// Invite player to a team
router.post("/team/invite", invitePlayer);

// Accept an invite
router.post("/team/invite/accept/:requestId", acceptInvite);

// Request to join a team
router.post("/team/join", requestToJoinTeam);

export default router;
