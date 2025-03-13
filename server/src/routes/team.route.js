import express from "express";
import {
  createTeams,
  getAllTeams,
  getTeamDetails,
  deleteTeam,
  inviteMemberInTeam,
  requestToJoinTeam,
  memberleaveTeam,
  deleteMember,
} from "../controllers/team.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Team Creation & Management Routes
router.post("/", protectRoute, createTeams); // works
router.get("/", getAllTeams); // works
router.get("/:teamId", protectRoute, getTeamDetails); // works
router.delete("/:teamId", protectRoute, deleteTeam);
// router.put("/:teamId", protectRoute, updateTeam);

// Team Members Add & Manage Routes
router.post("/:teamId/invite-member", protectRoute, inviteMemberInTeam); // working
router.delete("/:teamId/members/:memberId", protectRoute, deleteMember); // working`
// router.get("/:teamId/members", protectRoute, getTeamMembers);
// router.put("/:teamId/members/:memberId/role" , protectRoute, transferRole);

// Member Join Request System
router.post("/:teamId/join-request", protectRoute, requestToJoinTeam);
router.put("/:teamId/leave-team", protectRoute, memberleaveTeam); // working

export default router;

// 4. Invite System (if Owner wants to Invite Direct to then Members)
// POST /teams/:teamId/invite → Kisi player ko invite karne ke liye
// GET /users/:userId/invites → User ke pending invites dekhne ke liye
// PUT /users/:userId/invites/:inviteId → Invite accept/decline karne ke liye
// Bonus: Agar Kisi Team Me Max Members Ka Restriction Rakhna Ho
// GET /teams/:teamId/members/count → Team ke total members count dekhne ke liye
// POST /teams/:teamId/members me validation → Agar max limit cross ho jaye to restrict karna
