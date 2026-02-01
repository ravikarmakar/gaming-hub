import Team from "../models/team.model.js";
import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import Organizer from "../models/organizer.model.js";
import { CustomError } from "../utils/CustomError.js";
import { Roles, Scopes } from "../constants/roles.js";
import { Notification } from "../models/notification.model.js";
import { redis } from "../config/redis.js";

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
        console.error(`Error creating notification (${type}):`, error);
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
        const invite = await Invitation.findById(inviteId);

        if (!invite) {
            throw new CustomError("Invitation no longer exists", 404);
        }

        const teamId = invite.entityId || notification.relatedData.teamId;
        const team = await Team.findById(teamId);

        if (!team) {
            throw new CustomError("Team no longer exists", 404);
        }

        if (actionType === "ACCEPT") {
            // Check if user is already in a team
            const fullUser = await User.findById(req.user._id);
            if (fullUser.teamId) {
                throw new CustomError("You are already in a team", 400);
            }

            // Add user to team
            const alreadyMember = team.teamMembers.some((m) => m.user.toString() === req.user._id.toString());
            if (!alreadyMember) {
                await Team.findByIdAndUpdate(teamId, {
                    $push: {
                        teamMembers: {
                            user: req.user._id,
                            username: fullUser.username,
                            avatar: fullUser.avatar,
                            roleInTeam: invite.role === Roles.TEAM.MANAGER ? "manager" : "player",
                            joinedAt: new Date(),
                            isActive: true
                        }
                    }
                });

                // Update user's teamId and roles
                const teamRole = invite.role === Roles.TEAM.MANAGER ? Roles.TEAM.MANAGER : Roles.TEAM.PLAYER;
                await User.findByIdAndUpdate(req.user._id, {
                    $set: { teamId: teamId },
                    $push: {
                        roles: {
                            scope: Scopes.TEAM,
                            role: teamRole,
                            scopeId: teamId,
                            scopeModel: "Team",
                        },
                    },
                });

                // Invalidate Redis cache
                await redis.del(`user_profile:${req.user._id}`);
                await redis.del(`team_details:${teamId}`);
            }

            if (invite) {
                invite.status = "accepted";
                await invite.save();
            }

            return `You have accepted the invite to join ${team.teamName}`;
        } else if (actionType === "REJECT") {
            if (invite) {
                invite.status = "rejected";
                await invite.save();
            }
            return `You have declined the invite to join ${team.teamName}`;
        } else {
            throw new CustomError("Invalid action type", 400);
        }
    },

    ORG_INVITE: async (notification, actionType, req) => {
        const inviteId = notification.relatedData.inviteId;
        const invite = await Invitation.findById(inviteId);

        if (!invite) {
            throw new CustomError("Invitation no longer exists", 404);
        }

        const orgId = invite.entityId || notification.relatedData.orgId;
        const org = await Organizer.findById(orgId);

        if (!org) {
            throw new CustomError("Organization no longer exists", 404);
        }

        if (actionType === "ACCEPT") {
            const fullUser = await User.findById(req.user._id);

            if (fullUser.orgId) {
                throw new CustomError("You are already in an organization", 400);
            }

            // Check if user is already a member (redundant but safe)
            const alreadyMember = fullUser.roles.some(
                (r) => r.scope === Scopes.ORG && r.scopeId?.toString() === orgId.toString()
            );

            if (!alreadyMember) {
                // Update User: Add role and set orgId
                const invitedRole = invite.role || Roles.ORG.STAFF;
                await User.findByIdAndUpdate(req.user._id, {
                    $set: { orgId: orgId },
                    $push: {
                        roles: {
                            scope: Scopes.ORG,
                            role: invitedRole,
                            scopeId: orgId,
                            scopeModel: "Organizer",
                        },
                    },
                });

                // Update Organizer: Increment member count
                await Organizer.findByIdAndUpdate(orgId, {
                    $inc: { "stats.memberCount": 1 }
                });

                // Invalidate Redis cache
                await redis.del(`user_profile:${req.user._id}`);
            }

            invite.status = "accepted";
            await invite.save();

            return `You have successfully joined ${org.name}`;
        } else if (actionType === "REJECT") {
            invite.status = "rejected";
            await invite.save();
            return `You have declined the invite to join ${org.name}`;
        } else {
            throw new CustomError("Invalid action type", 400);
        }
    },

    // Future handlers can be added here easily:
    // TOURNAMENT_INVITE: async (notification, actionType, req) => { ... },
};
