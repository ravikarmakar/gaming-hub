import express from "express";
import {
  createOrg,
  getOrgDetails,
  updateOrg,
  deleteOrg,
  addStaff,
  updateStaffRole,
  removeStaff,
  getDashboardStats,
  transferOwnership,
  getOrganizers,
} from "./organizer.controller.js";
import {
  sendJoinRequest,
  getJoinRequests,
  handleJoinRequest,
} from "../join-request/join-request.controller.js";
import {
  getPendingInvitesForEntity,
  cancelInvitation,
} from "../invitation/invitation.controller.js";
import {
  isAuthenticated,
  isVerified,
} from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";
import { upload } from "../../shared/middleware/multer.middleware.js";
import { validateRequest } from "../../shared/middleware/validate.middleware.js";
import {
  createOrgValidation,
  updateOrgValidation,
  addStaffValidation,
  updateStaffRoleValidation,
  removeStaffValidation,
  joinOrgValidation,
  manageJoinRequestValidation,
  transferOwnershipValidation
} from "./organizer.validation.js";

const router = express.Router();

router.get("/", getOrganizers);

router.use(isAuthenticated, isVerified);

router.get("/dashboard", getDashboardStats);
router.post("/create-org", authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), upload.single("image"), validateRequest(createOrgValidation), createOrg);

router.get("/:orgId", authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), getOrgDetails);

router.put("/:orgId/update", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { attachDoc: true }), upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }]), validateRequest(updateOrgValidation), updateOrg);
router.delete("/:orgId/delete", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { attachDoc: true }), deleteOrg);

// Staff Management
router.put("/:orgId/add-staff", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER], { attachDoc: true }), validateRequest(addStaffValidation), addStaff);
router.put("/:orgId/update-staff-role", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { attachDoc: true }), validateRequest(updateStaffRoleValidation), updateStaffRole);
router.put("/:orgId/transfer-ownership", authorize(Scopes.ORG, [Roles.ORG.OWNER], { attachDoc: true }), validateRequest(transferOwnershipValidation), transferOwnership);
router.delete("/:orgId/remove-staff/:id", authorize(Scopes.ORG, [Roles.ORG.MANAGER, Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { attachDoc: true }), validateRequest(removeStaffValidation), removeStaff);

// Join Requests Management (Generic)
router.post("/:orgId/join", validateRequest(joinOrgValidation), sendJoinRequest);
router.get("/:orgId/join-requests", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER], { attachDoc: true }), getJoinRequests);
router.put("/:orgId/join-requests/:requestId", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER], { attachDoc: true }), validateRequest(manageJoinRequestValidation), handleJoinRequest);

// Invitation Management
router.get("/:orgId/invites", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER], { attachDoc: true }), getPendingInvitesForEntity);
router.delete("/:orgId/invites/:inviteId", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER], { attachDoc: true }), cancelInvitation);

export default router;
