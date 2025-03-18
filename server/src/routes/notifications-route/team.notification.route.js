import express from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../controllers/notification-controller/team.notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.put("/mark-read", protectRoute, markNotificationAsRead);

export default router;
