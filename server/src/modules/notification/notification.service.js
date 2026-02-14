import Team from "../team/team.model.js";
import Invitation from "../invitation/invitation.model.js";
import User from "../user/user.model.js";
import Organizer from "../organizer/organizer.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { Notification } from "../notification/notification.model.js";
import { redis } from "../../shared/config/redis.js";
import { logger } from "../../shared/utils/logger.js";
import mongoose from "mongoose";

/**
 * Service to create a notification with actions
 */
export const createNotificationWithActions = async ({
    recipient,
    sender,
    type,
    title,
    message,
    relatedData = {},
    actions = []
}) => {
    try {
        const notification = await Notification.create({
            recipient,
            sender,
            type,
            content: { title, message },
            relatedData,
            actions
        });
        return notification;
    } catch (error) {
        logger.error(`Error creating notification (${type}):`, error);
        // We generally don't want to block the main flow if notification fails
        return null;
    }
};

/**
 * Registry of handlers for different notification types.
 * Each handler should return the updated message or throw an error.
 */
export const notificationHandlers = {
    TEAM_INVITE: async (notification, actionType, req) => {
        const inviteId = notification.relatedData.inviteId;
        if (!inviteId) throw new CustomError("Invalid notification data: missing inviteId", 400);

        if (actionType === "ACCEPT") {
            const { acceptInvitationService } = await import("../invitation/invitation.service.js");
            return await acceptInvitationService(inviteId, req.user._id);
        } else if (actionType === "REJECT") {
            const invite = await Invitation.findById(inviteId);
            if (!invite) return "Invitation no longer exists.";

            invite.status = "rejected";
            await invite.save();

            notification.status = "archived";
            notification.actions = [];
            await notification.save();

            return `You have declined the invite to join the team.`;
        } else {
            throw new CustomError("Invalid action type", 400);
        }
    },

    ORGANIZATION_INVITE: async (notification, actionType, req) => {
        const inviteId = notification.relatedData.inviteId;
        if (!inviteId) throw new CustomError("Invalid notification data: missing inviteId", 400);

        if (actionType === "ACCEPT") {
            const { acceptInvitationService } = await import("../invitation/invitation.service.js");
            return await acceptInvitationService(inviteId, req.user._id);
        } else if (actionType === "REJECT") {
            const invite = await Invitation.findById(inviteId);
            if (!invite) return "Invitation no longer exists.";

            invite.status = "rejected";
            await invite.save();

            notification.status = "archived";
            notification.actions = [];
            await notification.save();

            return `You have declined the invite to join the organization.`;
        } else {
            throw new CustomError("Invalid action type", 400);
        }
    },
};
