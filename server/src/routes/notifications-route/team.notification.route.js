import express from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  getNotifications,
  respondToInvite,
} from "../../controllers/notification-controller/team.notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);

router.post("/:notificationId/respond", protectRoute, respondToInvite);

export default router;
