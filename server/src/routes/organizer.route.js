import express from "express";
import {
  createOrg,
  getOrgDetails,
  updateOrg,
  deleteOrg,
} from "../controllers/organizer.controller.js";
import { isAuthenticated, requireRole } from "../middleware/auth.middleware.js";
import { Roles, Scopes } from "../config/roles.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/create-org", createOrg);
router.get("/:orgId", getOrgDetails);
router.put("/update-org", requireRole(Roles.ORG.OWNER, Scopes.ORG), updateOrg); //, upload.single("image")
router.delete(
  "/delete-org",
  requireRole(Roles.ORG.OWNER, Scopes.ORG),
  deleteOrg
);

export default router;
