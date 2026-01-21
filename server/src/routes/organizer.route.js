import express from "express";
import {
  createOrg,
  getOrgDetails,
  updateOrg,
  deleteOrg,
  addStaff,
  updateStaffRole,
  removeStaff,
} from "../controllers/organizer.controller.js";
import {
  checkAnyRole,
  isAuthenticated,
  requireRole,
  isVerified,
} from "../middleware/auth.middleware.js";
import { Roles, Scopes } from "../config/roles.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.use(isAuthenticated, isVerified);

router.get("/", getOrgDetails);
router.get("/details/:orgId", getOrgDetails);

router.post("/create-org", upload.single("image"), createOrg);
router.put("/update-org", requireRole(Roles.ORG.OWNER, Scopes.ORG), updateOrg); //, upload.single("image")
router.delete(
  "/delete-org",
  requireRole(Roles.ORG.OWNER, Scopes.ORG),
  deleteOrg
);
router.put(
  "/add-staff",
  checkAnyRole([Roles.ORG.MANAGER, Roles.ORG.OWNER], Scopes.ORG),
  addStaff
);
router.put(
  "/update-staff-role",
  requireRole(Roles.ORG.OWNER, Scopes.ORG),
  updateStaffRole
);
router.delete(
  "/remove-staff/:id",
  checkAnyRole([Roles.ORG.MANAGER, Roles.ORG.OWNER], Scopes.ORG),
  removeStaff
);

export default router;

// to-do --> fetch all organizers & express validations are remain
