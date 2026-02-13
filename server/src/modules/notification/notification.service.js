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
        // 1. Basic Validation
        const inviteId = notification.relatedData.inviteId;
        if (!inviteId) throw new CustomError("Invalid notification data: missing inviteId", 400);

        // 2. Transaction for Atomicity & TOCTOU Prevention
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 3. Re-fetch Invite INSIDE Transaction (Lock if needed, but atomic findAndUpdate is better)
            // We use findById to check status first
            const invite = await Invitation.findById(inviteId).session(session);

            if (!invite) {
                // If invite is gone, archive notification immediately
                notification.status = "archived";
                notification.actions = []; // Remove actions
                await notification.save({ session });

                await session.commitTransaction();
                return "This invitation no longer exists.";
            }

            // 4. Validate Status - Prevent double processing
            if (invite.status !== 'pending') {
                notification.status = "archived";
                notification.actions = [];
                await notification.save({ session });

                await session.commitTransaction();
                return `This invitation has already been ${invite.status}.`;
            }

            // 5. Security: Validate Recipient
            if (invite.receiver.toString() !== req.user._id.toString()) {
                throw new CustomError("Access Denied: You are not the recipient of this invitation", 403);
            }

            const teamId = invite.entityId || notification.relatedData.teamId;
            const team = await Team.findById(teamId).session(session);

            if (!team) {
                throw new CustomError("Team no longer exists", 404);
            }

            // 6. Handle Actions
            if (actionType === "ACCEPT") {
                // Check if user is already in a team
                const fullUser = await User.findById(req.user._id).session(session);
                if (fullUser.teamId) {
                    throw new CustomError("You are already in a team", 400);
                }

                // Add user to team if not already member
                const alreadyMember = team.teamMembers.some((m) => m.user.toString() === req.user._id.toString());
                if (!alreadyMember) {
                    // Check Member Limit (Max 20)
                    if (team.teamMembers.length >= 20) {
                        throw new CustomError("Team has reached its member limit (20).", 400);
                    }

                    const teamRole = invite.role === Roles.TEAM.MANAGER ? "manager" : "player";

                    await Team.findByIdAndUpdate(
                        teamId,
                        {
                            $push: {
                                teamMembers: {
                                    user: req.user._id,
                                    username: fullUser.username,
                                    avatar: fullUser.avatar,
                                    roleInTeam: teamRole,
                                    joinedAt: new Date(),
                                    isActive: true
                                }
                            }
                        },
                        { session }
                    );

                    // Update User
                    const userRole = invite.role === Roles.TEAM.MANAGER ? Roles.TEAM.MANAGER : Roles.TEAM.PLAYER;
                    await User.findByIdAndUpdate(
                        req.user._id,
                        {
                            $set: { teamId: teamId },
                            $push: {
                                roles: {
                                    scope: Scopes.TEAM,
                                    role: userRole,
                                    scopeId: teamId,
                                    scopeModel: "Team",
                                },
                            },
                        },
                        { session }
                    );
                }

                invite.status = "accepted";
                await invite.save({ session });

                // 7. Archive Notification on Success
                notification.status = "archived";
                notification.actions = [];
                await notification.save({ session });

                await session.commitTransaction();

                // Invalidate Cache
                try {
                    await redis.del(`user_profile:${req.user._id}`);
                    await redis.del(`team_details:${teamId}`);
                } catch (e) {
                    logger.warn("Cache invalidation failed", e);
                }

                return `You have accepted the invite to join ${team.teamName}`;

            } else if (actionType === "REJECT") {
                invite.status = "rejected";
                await invite.save({ session });

                // Archive Notification
                notification.status = "archived";
                notification.actions = [];
                await notification.save({ session });

                await session.commitTransaction();
                return `You have declined the invite to join ${team.teamName}`;
            } else {
                throw new CustomError("Invalid action type", 400);
            }

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    },

    ORG_INVITE: async (notification, actionType, req) => {
        const inviteId = notification.relatedData.inviteId;
        if (!inviteId) throw new CustomError("Invalid notification data: missing inviteId", 400);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const invite = await Invitation.findById(inviteId).session(session);

            if (!invite) {
                notification.status = "archived";
                notification.actions = [];
                await notification.save({ session });
                await session.commitTransaction();
                return "This invitation no longer exists.";
            }

            if (invite.status !== 'pending') {
                notification.status = "archived";
                notification.actions = [];
                await notification.save({ session });
                await session.commitTransaction();
                return `This invitation has already been ${invite.status}.`;
            }

            if (invite.receiver.toString() !== req.user._id.toString()) {
                throw new CustomError("Access Denied: You are not the recipient of this invitation", 403);
            }

            const orgId = invite.entityId || notification.relatedData.orgId;
            const org = await Organizer.findById(orgId).session(session);

            if (!org) {
                throw new CustomError("Organization no longer exists", 404);
            }

            if (actionType === "ACCEPT") {
                const fullUser = await User.findById(req.user._id).session(session);

                if (fullUser.orgId) {
                    throw new CustomError("You are already in an organization", 400);
                }

                const alreadyMember = fullUser.roles.some(
                    (r) => r.scope === Scopes.ORG && r.scopeId?.toString() === orgId.toString()
                );

                if (!alreadyMember) {
                    // Update User
                    const invitedRole = invite.role || Roles.ORG.STAFF;
                    await User.findByIdAndUpdate(
                        req.user._id,
                        {
                            $set: { orgId: orgId },
                            $push: {
                                roles: {
                                    scope: Scopes.ORG,
                                    role: invitedRole,
                                    scopeId: orgId,
                                    scopeModel: "Organizer",
                                },
                            },
                        },
                        { session }
                    );

                    // Update Organizer
                    await Organizer.findByIdAndUpdate(
                        orgId,
                        { $inc: { "stats.memberCount": 1 } },
                        { session }
                    );
                }

                invite.status = "accepted";
                await invite.save({ session });

                notification.status = "archived";
                notification.actions = [];
                await notification.save({ session });

                await session.commitTransaction();

                try {
                    await redis.del(`user_profile:${req.user._id}`);
                    await redis.del(`org_details:${orgId}`);
                } catch (e) {
                    logger.warn("Cache invalidation failed ", e);
                }

                return `You have successfully joined ${org.name}`;

            } else if (actionType === "REJECT") {
                invite.status = "rejected";
                await invite.save({ session });

                notification.status = "archived";
                notification.actions = [];
                await notification.save({ session });

                await session.commitTransaction();
                return `You have declined the invite to join ${org.name}`;
            } else {
                throw new CustomError("Invalid action type", 400);
            }
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    },
};
