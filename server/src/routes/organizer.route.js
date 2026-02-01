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
} from "../controllers/organizer.controller.js";
import {
  sendJoinRequest,
  getJoinRequests,
  handleJoinRequest,
} from "../controllers/join-request.controller.js";
import {
  isAuthenticated,
  isVerified,
} from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.middleware.js";
import { Scopes, Roles } from "../constants/roles.js";
import { upload } from "../middleware/multer.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
  createOrgValidation,
  updateOrgValidation,
  addStaffValidation,
  updateStaffRoleValidation,
  removeStaffValidation,
  joinOrgValidation,
  manageJoinRequestValidation,
  transferOwnershipValidation
} from "../validations/organizer.validation.js";

const router = express.Router();

router.use(isAuthenticated, isVerified);

router.get("/dashboard", getDashboardStats);
router.post("/create-org", authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), upload.single("image"), validateRequest(createOrgValidation), createOrg);

router.get("/:orgId", authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), getOrgDetails);

router.put("/:orgId/update", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { attachDoc: true }), upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }]), validateRequest(updateOrgValidation), updateOrg);
router.delete("/:orgId/delete", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { attachDoc: true }), deleteOrg);

// Staff Management
router.put("/:orgId/add-staff", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER], { attachDoc: true }), validateRequest(addStaffValidation), addStaff);
router.put("/:orgId/update-staff-role", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { attachDoc: true }), validateRequest(updateStaffRoleValidation), updateStaffRole);
router.put("/:orgId/transfer-ownership", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { attachDoc: true }), validateRequest(transferOwnershipValidation), transferOwnership);
router.delete("/:orgId/remove-staff/:id", authorize(Scopes.ORG, [Roles.ORG.MANAGER, Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { attachDoc: true }), validateRequest(removeStaffValidation), removeStaff);

// Join Requests Management (Generic)
router.post("/:orgId/join", validateRequest(joinOrgValidation), sendJoinRequest);
router.get("/:orgId/join-requests", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER]), getJoinRequests);
router.put("/:orgId/join-requests/:requestId", authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER]), validateRequest(manageJoinRequestValidation), handleJoinRequest);

export default router;
