import express from "express";
import {
  createTeam,
  fetchAllTeams,
  fetchTeamDetails,
  deleteTeam,
  leaveMember,
  transferTeamOwnerShip,
  updateTeam,
  addMembers,
  removeMember,
  manageMemberRole,
} from "../controllers/team.controller.js";
import { isAuthenticated, isVerified } from "../middleware/auth.middleware.js";
import { ensurePartOfTeam, ensureTeamCaptain } from "../middleware/team.middleware.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.get("/", fetchAllTeams);
router.get("/details/:teamId", fetchTeamDetails);

router.use(isAuthenticated, isVerified);

router.post("/create-team", upload.single("image"), createTeam);
router.put(
  "/update-team",
  ensurePartOfTeam,
  ensureTeamCaptain,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateTeam
);
router.put("/add-members", ensurePartOfTeam, ensureTeamCaptain, addMembers);
router.put("/remove-member/:id", ensurePartOfTeam, ensureTeamCaptain, removeMember);
router.put("/leave-member", ensurePartOfTeam, leaveMember);
router.put("/transfer-owner", ensurePartOfTeam, ensureTeamCaptain, transferTeamOwnerShip);
router.put("/manage-member-role", ensurePartOfTeam, ensureTeamCaptain, manageMemberRole);
router.delete("/delete-team", ensurePartOfTeam, ensureTeamCaptain, deleteTeam);

export default router;
