import express from "express";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationAction,
    getOrgNotifications,
} from "../notification/notification.controller.js";

const router = express.Router();

// All notification routes are protected
router.use(isAuthenticated);

router.get("/", getMyNotifications);
router.get("/org/:orgId", getOrgNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.post("/:id/action", handleNotificationAction);

export default router;
