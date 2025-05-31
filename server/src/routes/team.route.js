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
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.get("/", fetchAllTeams);
router.get("/details/:teamId", fetchTeamDetails);

router.use(isAuthenticated);

router.post("/create-team", upload.single("image"), createTeam);
router.put("/update-team", updateTeam);
router.put("/add-members", addMembers);
router.delete("/remove-member", removeMember);
router.put("/leave-member", leaveMember);
router.put("/transfer-owner", transferTeamOwnerShip);
router.put("/manage-member-role", manageMemberRole);
router.delete("/delete-team", deleteTeam);

export default router;
