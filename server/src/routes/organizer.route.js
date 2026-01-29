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
  joinOrg,
  getOrgJoinRequests,
  manageJoinRequest,
  inviteStaffToOrg,
  getOrgPendingInvites,
  cancelOrgInvite
} from "../controllers/organizer.controller.js";
import {
  isAuthenticated,
  isVerified,
} from "../middleware/auth.middleware.js";
import { guardOrgAccess } from "../middleware/organizer.middleware.js";
import { Roles } from "../constants/roles.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.use(isAuthenticated, isVerified);

router.get("/dashboard", getDashboardStats);
router.post("/create-org", upload.single("image"), createOrg);
router.post("/:orgId/join", joinOrg); // Public (authenticated) route for users to join

router.get("/:orgId", getOrgDetails);

router.put("/:orgId/update", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.MANAGER]), upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }]), updateOrg);
router.delete("/:orgId/delete", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.CO_OWNER]), deleteOrg);
router.put("/:orgId/add-staff", guardOrgAccess([Roles.ORG.MANAGER, Roles.ORG.OWNER, Roles.ORG.CO_OWNER]), addStaff); // Legacy add staff, eventually replace with invites
router.put("/:orgId/update-staff-role", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.CO_OWNER]), updateStaffRole);
router.put("/:orgId/transfer-ownership", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.CO_OWNER]), transferOwnership);
router.delete("/:orgId/remove-staff/:id", guardOrgAccess([Roles.ORG.MANAGER, Roles.ORG.OWNER, Roles.ORG.CO_OWNER]), removeStaff);

// Join Requests Management
router.get("/:orgId/join-requests", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER]), getOrgJoinRequests);
router.put("/:orgId/join-requests/:requestId", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER]), manageJoinRequest);

// Invitation Management
router.post("/:orgId/invite", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.MANAGER]), inviteStaffToOrg);
router.get("/:orgId/invites", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.MANAGER]), getOrgPendingInvites);
router.delete("/:orgId/invites/:inviteId", guardOrgAccess([Roles.ORG.OWNER, Roles.ORG.MANAGER]), cancelOrgInvite);

export default router;

// TODO: fetch all organizers & express validations are remain
