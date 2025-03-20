import { Router } from "express";
import {
  createOrganization,
  organizationProfile,
} from "../../controllers/organization-controller/organization.controller.js";
import {
  authorizeRoles,
  protectRoute,
} from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/", protectRoute, authorizeRoles("organizer"), createOrganization);
router.get(
  "/dashboard",
  protectRoute,
  authorizeRoles("organizer"),
  organizationProfile
);

export default router;
