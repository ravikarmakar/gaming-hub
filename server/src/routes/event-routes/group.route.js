import express from "express";
import {
  createGroups,
  getGroups,
  groupDetails,
} from "../../controllers/event-controllers/group.controller.js";
import {
  authorizeRoles,
  protectRoute,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  protectRoute,
  authorizeRoles("organizer", "moderator", "staff"),
  createGroups
);
router.get("/:groupId", protectRoute, groupDetails);
router.get("/", getGroups);

export default router;
