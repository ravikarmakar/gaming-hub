import Team from "../models/team.model.js";
import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import Organizer from "../models/organizer.model.js";
import { errorHandle } from "../middleware/error.middleware.js";
import { Roles, Scopes } from "../config/roles.js";
import { redis } from "../config/redisClient.js";

/**
 * Registry of handlers for different notification types.
 * Each handler should return the updated message or throw an error.
 */
export const notificationHandlers = {
    TEAM_INVITE: async (notification, actionType, req) => {
        const inviteId = notification.relatedData.inviteId;
        const invite = await Invitation.findById(inviteId);

        if (!invite) {
            throw new errorHandle("Invitation no longer exists", 404);
        }

        const teamId = invite.entityId || notification.relatedData.teamId;
        const team = await Team.findById(teamId);

        if (!team) {
            throw new errorHandle("Team no longer exists", 404);
        }

        if (actionType === "ACCEPT") {
            // Check if user is already in a team
            const fullUser = await User.findById(req.user._id);
            if (fullUser.teamId) {
                throw new errorHandle("You are already in a team", 400);
            }

            // Add user to team
            const alreadyMember = team.teamMembers.some((m) => m.user.toString() === req.user._id.toString());
            if (!alreadyMember) {
                team.teamMembers.push({
                    user: req.user._id,
                    roleInTeam: invite.role === Roles.TEAM.MANAGER ? "manager" : "player",
                    joinedAt: new Date(),
                    isActive: true
                });
                await team.save();

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
            throw new errorHandle("Invalid action type", 400);
        }
    },

    ORG_INVITE: async (notification, actionType, req) => {
        const inviteId = notification.relatedData.inviteId;
        const invite = await Invitation.findById(inviteId);

        if (!invite) {
            throw new errorHandle("Invitation no longer exists", 404);
        }

        const orgId = invite.entityId || notification.relatedData.orgId;
        const org = await Organizer.findById(orgId);

        if (!org) {
            throw new errorHandle("Organization no longer exists", 404);
        }

        if (actionType === "ACCEPT") {
            const fullUser = await User.findById(req.user._id);

            if (fullUser.orgId) {
                throw new errorHandle("You are already in an organization", 400);
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
            throw new errorHandle("Invalid action type", 400);
        }
    },

    // Future handlers can be added here easily:
    // TOURNAMENT_INVITE: async (notification, actionType, req) => { ... },
};
