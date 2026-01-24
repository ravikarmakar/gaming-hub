import Team from "../models/team.model.js";
import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import { errorHandle } from "../middleware/error.middleware.js";

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
                    roleInTeam: notification.actions.find(a => a.actionType === "ACCEPT")?.payload?.role || "player",
                    joinedAt: new Date(),
                    isActive: true
                });
                await team.save();

                // Update user's teamId
                await User.findByIdAndUpdate(req.user._id, { teamId: teamId });
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

    // Future handlers can be added here easily:
    // TOURNAMENT_INVITE: async (notification, actionType, req) => { ... },
};
