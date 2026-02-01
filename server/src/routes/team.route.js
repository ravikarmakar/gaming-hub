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
  manageStaffRole,
} from "../controllers/team.controller.js";
import {
  sendJoinRequest,
  getJoinRequests,
  handleJoinRequest,
} from "../controllers/join-request.controller.js";
import { isAuthenticated, isVerified, optionalAuthenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";
import { Scopes, Roles } from "../constants/roles.js";
import { upload } from "../middleware/multer.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
  createTeamValidation,
  updateTeamValidation,
  addMembersValidation,
  manageMemberRoleValidation,
  manageStaffRoleValidation,
  transferOwnerValidation,
  manageJoinRequestValidation,
} from "../validations/team.validation.js";

const router = express.Router();

router.get("/", fetchAllTeams);

router.post("/create-team", isAuthenticated, isVerified, upload.single("image"), validateRequest(createTeamValidation), createTeam);
router.get("/details/:teamId", optionalAuthenticate, fetchTeamDetails);

router.put(
  "/update-team",
  isAuthenticated,
  isVerified,
  authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validateRequest(updateTeamValidation),
  updateTeam
);

router.put("/add-members", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }), validateRequest(addMembersValidation), addMembers);
router.put("/remove-member/:id", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }), removeMember);
router.put("/leave-member", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.PLAYER, Roles.TEAM.MANAGER], { attachDoc: true }), leaveMember);
router.put("/transfer-owner", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER], { attachDoc: true }), validateRequest(transferOwnerValidation), transferTeamOwnerShip);
router.put("/manage-member-role", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }), validateRequest(manageMemberRoleValidation), manageMemberRole);
router.put("/manage-staff-role", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER], { attachDoc: true }), validateRequest(manageStaffRoleValidation), manageStaffRole);
router.delete("/delete-team", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER], { attachDoc: true }), deleteTeam);

// Join Request Routes
router.post("/:teamId/join-request", isAuthenticated, isVerified, sendJoinRequest);
router.get("/join-requests/all", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER]), getJoinRequests);
router.put("/join-requests/:requestId", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER]), validateRequest(manageJoinRequestValidation), handleJoinRequest);

export default router;
