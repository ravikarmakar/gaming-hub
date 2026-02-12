import Team from "../team/team.model.js";
import Invitation from "../invitation/invitation.model.js";
import User from "../user/user.model.js";
import Organizer from "../organizer/organizer.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { Notification } from "../notification/notification.model.js";
import { redis } from "../../shared/config/redis.js";
import { logger } from "../../shared/utils/logger.js";

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
        const invite = await Invitation.findById(inviteId);

        if (!invite) {
            notification.status = "archived";
            notification.actions = [];
            await notification.save();
            return "This invitation no longer exists or has been cancelled.";
        }

        // Security: Validate that the invite recipient matches the requesting user
        if (invite.receiver.toString() !== req.user._id.toString()) {
            throw new CustomError("Access Denied: You are not the recipient of this invitation", 403);
        }

        const teamId = invite.entityId || notification.relatedData.teamId;
        const team = await Team.findById(teamId);

        if (!team) {
            throw new CustomError("Team no longer exists", 404);
        }

        if (actionType === "ACCEPT") {
            // Use atomic transaction for team join operation
            const session = await User.startSession();
            session.startTransaction();

            try {
                // Re-fetch team inside transaction to ensure it still exists and lock state if necessary
                // This prevents TOCTOU (Time-of-Check Time-of-Use) race conditions
                const teamInTx = await Team.findById(teamId).session(session);
                if (!teamInTx) {
                    throw new CustomError("Team no longer exists", 404);
                }

                // Check if user is already in a team
                const fullUser = await User.findById(req.user._id).session(session);
                if (fullUser.teamId) {
                    throw new CustomError("You are already in a team", 400);
                }

                // Add user to team
                const alreadyMember = teamInTx.teamMembers.some((m) => m.user.toString() === req.user._id.toString());
                if (!alreadyMember) {
                    await Team.findByIdAndUpdate(
                        teamId,
                        {
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
                        },
                        { session }
                    );

                    // Update user's teamId and roles
                    const teamRole = invite.role === Roles.TEAM.MANAGER ? Roles.TEAM.MANAGER : Roles.TEAM.PLAYER;
                    await User.findByIdAndUpdate(
                        req.user._id,
                        {
                            $set: { teamId: teamId },
                            $push: {
                                roles: {
                                    scope: Scopes.TEAM,
                                    role: teamRole,
                                    scopeId: teamId,
                                    scopeModel: "Team",
                                },
                            },
                        },
                        { session }
                    );
                }

                if (invite) {
                    invite.status = "accepted";
                    await invite.save({ session });
                }

                await session.commitTransaction();

                // Invalidate Redis cache after successful transaction
                try {
                    await redis.del(`user_profile:${req.user._id}`);
                    await redis.del(`team_details:${teamId}`);
                } catch (cacheError) {
                    logger.warn("Cache invalidation failed after team join:", cacheError);
                }
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
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
            notification.status = "archived";
            notification.actions = [];
            await notification.save();
            return "This invitation no longer exists or has been cancelled.";
        }

        // Security: Validate that the invite recipient matches the requesting user
        if (invite.receiver.toString() !== req.user._id.toString()) {
            throw new CustomError("Access Denied: You are not the recipient of this invitation", 403);
        }

        const orgId = invite.entityId || notification.relatedData.orgId;
        const org = await Organizer.findById(orgId);

        if (!org) {
            throw new CustomError("Organization no longer exists", 404);
        }

        if (actionType === "ACCEPT") {
            // Use atomic transaction for org join operation
            const session = await User.startSession();
            session.startTransaction();

            try {
                const fullUser = await User.findById(req.user._id).session(session);

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

                    // Update Organizer: Increment member count
                    await Organizer.findByIdAndUpdate(
                        orgId,
                        {
                            $inc: { "stats.memberCount": 1 }
                        },
                        { session }
                    );
                }

                invite.status = "accepted";
                await invite.save({ session });

                await session.commitTransaction();

                // Invalidate Redis cache after successful transaction
                try {
                    await redis.del(`user_profile:${req.user._id}`);
                    await redis.del(`org_details:${orgId}`);
                } catch (cacheError) {
                    logger.warn("Cache invalidation failed after org join:", cacheError);
                }
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }

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
