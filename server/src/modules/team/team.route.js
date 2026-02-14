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
} from "./team.controller.js";
import { cache } from "../../shared/middleware/cache.middleware.js";
import { isAuthenticated, isVerified, optionalAuthenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";
import { upload } from "../../shared/middleware/multer.middleware.js";
import { validateRequest } from "../../shared/middleware/validate.middleware.js";
import { cleanupRequestFiles } from "../../shared/middleware/fileCleanup.middleware.js";
import {
  createTeamValidation,
  updateTeamValidation,
  addMembersValidation,
  removeMemberValidation,
  manageMemberRoleValidation,
  manageStaffRoleValidation,
  transferOwnerValidation,
} from "./team.validation.js";

const router = express.Router();

// Helper wrapper to cleanup files on validation error
const validateWithCleanup = (schema) => (req, res, next) => {
  const middleware = validateRequest(schema);
  middleware(req, res, (err) => {
    if (err) {
      cleanupRequestFiles(req);
      return next(err);
    }
    next();
  });
};

router.get("/", cache(300), fetchAllTeams);

// Use validateWithCleanup for routes with file uploads
router.post("/create-team", isAuthenticated, isVerified, upload.single("image"), validateWithCleanup(createTeamValidation), createTeam);
router.get("/details/:teamId", optionalAuthenticate, cache(300), fetchTeamDetails);

router.put(
  "/update-team",
  isAuthenticated,
  isVerified,
  authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validateWithCleanup(updateTeamValidation),
  updateTeam
);

router.put("/add-members", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }), validateRequest(addMembersValidation), addMembers);
router.put("/remove-member/:id", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }), validateRequest(removeMemberValidation), removeMember);
router.put("/leave-member", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.PLAYER, Roles.TEAM.MANAGER], { attachDoc: true }), leaveMember);
router.put("/transfer-owner", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER], { attachDoc: true }), validateRequest(transferOwnerValidation), transferTeamOwnerShip);
router.put("/manage-member-role", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER, Roles.TEAM.MANAGER], { attachDoc: true }), validateRequest(manageMemberRoleValidation), manageMemberRole);
router.put("/manage-staff-role", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER], { attachDoc: true }), validateRequest(manageStaffRoleValidation), manageStaffRole);
router.delete("/delete-team", isAuthenticated, isVerified, authorize(Scopes.TEAM, [Roles.TEAM.OWNER], { attachDoc: true }), deleteTeam);

// NOTE: Join Request routes have been moved to a dedicated router
// See: server/src/modules/join-request/join-request.route.js
// Routes are still accessible at /api/v1/teams/:teamId/join-request(s)

export default router;
