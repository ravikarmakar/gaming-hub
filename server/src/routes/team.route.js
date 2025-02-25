import express from "express";
import {
  createTeams,
  getAllTeams,
  getOneTeam,
  deleteTeam,
  invitePlayer,
  requestToJoinTeam,
} from "../controllers/team.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Team Creation & Retrieval ------------------------------------------------------
router.post("/", protectRoute, createTeams); // works
router.get("/", protectRoute, getAllTeams); // works
router.get("/:teamId", protectRoute, getOneTeam); // works
router.delete("/:teamId", protectRoute, deleteTeam);
// router.put("/:teamId", protectRoute, updateTeam);

// Invite system, only captain or owner can invite------------------------------------------
router.post("/:teamId/invite", protectRoute, invitePlayer);

// router.get("/teamId/members", protectRoute, getMembers);
// router.delete("/:teamId/members/:memberId", protectRoute, deleteMamber);
// router.put("/:teamId/members/:memberId/role" , protectRoute, transferRole);

// Accept an invite by admin Only ------------------------------------------------

// Request to join a team by user --------------------------------------------------
router.post("/:teamId/join-request", requestToJoinTeam);

export default router;

// . Team Creation & Management Routes
// POST /teams → Nayi team create karne ke liye
// GET /teams/:teamId → Specific team ki details retrieve karne ke liye
// PUT /teams/:teamId → Team details update karne ke liye
// DELETE /teams/:teamId → Team delete karne ke liye

// 2. Team Members Add & Manage Routes
// POST /teams/:teamId/members → Team me naye member ko add karne ke liye
// GET /teams/:teamId/members → Team ke sare members dekhne ke liye
// DELETE /teams/:teamId/members/:memberId → Kisi member ko remove karne ke liye
// PUT /teams/:teamId/members/:memberId/role → Member ka role update karne ke liye (captain, player, sub, etc.)

// 3. Member Join Request System (Agar Invite System Implement Karna Ho)
// POST /teams/:teamId/join-request → Member request bhejne ke liye
// GET /teams/:teamId/join-requests → Team owner ke liye pending requests dekhne ke liye
// PUT /teams/:teamId/join-requests/:requestId → Request accept/decline karne ke liye

// 4. Invite System (Agar Owner Members Ko Direct Invite Karna Chahta Hai)
// POST /teams/:teamId/invite → Kisi player ko invite karne ke liye
// GET /users/:userId/invites → User ke pending invites dekhne ke liye
// PUT /users/:userId/invites/:inviteId → Invite accept/decline karne ke liye
// Bonus: Agar Kisi Team Me Max Members Ka Restriction Rakhna Ho
// GET /teams/:teamId/members/count → Team ke total members count dekhne ke liye
// POST /teams/:teamId/members me validation → Agar max limit cross ho jaye to restrict karna

// Ye sab depend karta hai ki aapka team system kaise work karega. Agar direct add karna hai toh simple POST /teams/:teamId/members enough hai, lekin agar request/invite system chahiye toh extra routes lagenge.
