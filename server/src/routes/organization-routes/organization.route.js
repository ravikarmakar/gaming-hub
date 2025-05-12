import { Router } from "express";
import {
  createOrganization,
  organizationProfile,
  allEventsOfOrganizer,
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
  authorizeRoles("organizer", "staff"),
  organizationProfile
);
router.get("/:organizerId/all-events", allEventsOfOrganizer);

export default router;
