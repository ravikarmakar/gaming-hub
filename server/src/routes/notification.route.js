import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
    getMyNotifications,
    markAsRead,
    handleNotificationAction,
} from "../controllers/notification.controller.js";

const router = express.Router();

// All notification routes are protected
router.use(isAuthenticated);

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.post("/:id/action", handleNotificationAction);

export default router;
