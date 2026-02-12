import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { Notification } from "../notification/notification.model.js";
import Team from "../team/team.model.js";
import Invitation from "../invitation/invitation.model.js";
import User from "../user/user.model.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * @desc Get notifications for the logged-in user
 * @route GET /api/v1/notifications
 * @access Private
 */
export const getMyNotifications = TryCatchHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "username avatar")
        .populate("relatedData.teamId", "teamName imageUrl")
        .populate("relatedData.eventId", "eventName banner");

    const totalCount = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        status: "unread",
    });

    res.status(200).json({
        success: true,
        notifications,
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            unreadCount,
        },
    });
});

/**
 * @desc Mark a notification as read
 * @route PATCH /api/v1/notifications/:id/read
 * @access Private
 */
export const markAsRead = TryCatchHandler(async (req, res, next) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id,
    });

    if (!notification) {
        return next(new CustomError("Notification not found", 404));
    }

    notification.status = "read";
    await notification.save();

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
    });
});

/**
 * @desc Mark all notifications as read
 * @route PATCH /api/v1/notifications/read-all
 * @access Private
 */
export const markAllAsRead = TryCatchHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, status: "unread" },
        { status: "read" }
    );

    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
    });
});

import { createNotificationWithActions, notificationHandlers } from "./notification.service.js";

/**
 * @desc Handle notification action (Accept/Reject)
 * @route POST /api/v1/notifications/:id/action
 * @access Private
 */
export const handleNotificationAction = TryCatchHandler(async (req, res, next) => {
    const { actionType } = req.body;
    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id,
    });

    if (!notification) {
        return next(new CustomError("Notification not found", 404));
    }

    if (notification.status === "archived") {
        return next(new CustomError("Notification already handled", 400));
    }

    // Use the strategy pattern to handle different types
    const handler = notificationHandlers[notification.type];

    if (handler) {
        try {
            const resultMessage = await handler(notification, actionType, req);
            notification.content.message = resultMessage;
        } catch (error) {
            return next(error);
        }
    } else {
        // Fallback for notifications with no server-side "ACCEPT/REJECT" logic
        // For example, "VIEW" only notifications
        if (actionType !== "VIEW") {
            logger.warn(`No handler found for notification type: ${notification.type}`);
        }
    }

    // Archive notification after action
    notification.status = "archived";
    await notification.save();

    res.status(200).json({
        success: true,
        message: `Action ${actionType} performed successfully`,
    });
});

/**
 * @desc Get notifications for a specific organization
 * @route GET /api/v1/notifications/org/:orgId
 * @access Private
 */
export const getOrgNotifications = TryCatchHandler(async (req, res) => {
    const { orgId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ "relatedData.orgId": orgId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "username avatar")
        .populate("relatedData.teamId", "teamName imageUrl")
        .populate("relatedData.eventId", "eventName banner");

    const totalCount = await Notification.countDocuments({ "relatedData.orgId": orgId });
    const unreadCount = await Notification.countDocuments({
        "relatedData.orgId": orgId,
        status: "unread",
    });

    res.status(200).json({
        success: true,
        notifications,
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            unreadCount,
        },
    });
});

/**
 * @desc Create a notification (Internal utility)
 */
export const createNotification = async (data) => {
    try {
        await Notification.create(data);
    } catch (error) {
        logger.error("Error creating notification:", error);
    }
};
