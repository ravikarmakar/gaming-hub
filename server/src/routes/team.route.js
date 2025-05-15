import express from "express";
import {
  createTeams,
  getAllTeams,
  getTeamProfile,
  deleteTeam,
  memberleaveTeam,
  deleteMember,
  transferRole,
  assignTeamCaptain,
} from "../controllers/team.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Team Creation & Management Routes
router.post("/", protectRoute, createTeams);
router.get("/", getAllTeams);
router.get("/:teamId/profile", protectRoute, getTeamProfile);
router.delete("/", protectRoute, deleteTeam);
// router.put("/:teamId", protectRoute, updateTeam);

router.put("/leave-team", protectRoute, memberleaveTeam);
router.delete("/remove-member", protectRoute, deleteMember);
router.put("/transfer-role", protectRoute, transferRole);
router.put("/assign-captain", protectRoute, assignTeamCaptain);

export default router;
