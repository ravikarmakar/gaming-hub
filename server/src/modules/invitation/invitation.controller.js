import Invitation from "../invitation/invitation.model.js";
import Team from "../team/team.model.js";
import User from "../user/user.model.js";
import Organizer from "../organizer/organizer.model.js";
import { Notification } from "../notification/notification.model.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { createNotification } from "../notification/notification.controller.js";
import { createNotificationWithActions } from "../notification/notification.service.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import AppError from "../../shared/utils/AppError.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * @desc Get all invitations for the logged-in user
 */
export const getAllInvitations = TryCatchHandler(async (req, res) => {
  const { userId } = req.user;
  const invitations = await Invitation.find({
    receiver: userId,
    status: "pending",
  }).populate("entityId", "name teamName imageUrl avatar").sort("-createdAt");

  res.status(200).json({
    success: true,
    data: invitations,
  });
});

/**
 * @desc Generic Invite logic for Teams and Organizations
 */
export const inviteMember = TryCatchHandler(async (req, res) => {
  const { email, role, targetId, targetModel, playerId, userId: inputUserId } = req.body;
  const { userId } = req.user;

  // 1. Identify Target
  let target = null;
  if (targetModel === "Team") {
    target = await Team.findById(targetId);
  } else if (targetModel === "Organizer") {
    target = await Organizer.findById(targetId);
  }

  if (!target) throw new AppError(`${targetModel} not found or undefined`, 404);

  // 2. Find Invitee (Support both Email and ID)
  let invitee = null;
  const lookupId = playerId || inputUserId;

  if (lookupId) {
    invitee = await User.findById(lookupId);
  } else if (email) {
    invitee = await User.findOne({ email: email.toLowerCase() });
  }

  if (!invitee) throw new AppError("User not found to invite", 404);

  // 3. Check for existing membership
  if (targetModel === "Team" && invitee.teamId?.toString() === targetId.toString()) {
    throw new AppError("User is already a member of this team", 400);
  }
  if (targetModel === "Organizer" && invitee.orgId?.toString() === targetId.toString()) {
    throw new AppError("User is already a member of this organization", 400);
  }

  // 4. Check for duplicate invitation
  const existingInvite = await Invitation.findOne({
    entityId: targetId,
    receiver: invitee._id,
    status: "pending"
  });
  if (existingInvite) throw new AppError("Invitation already sent to this user", 400);

  // 5. Create Invitation
  const invitedRole = role || (targetModel === "Team" ? Roles.TEAM.MEMBER : Roles.ORG.STAFF);

  const invitation = await Invitation.create({
    sender: userId,
    receiver: invitee._id,
    receiverModel: "User",
    entityId: targetId,
    entityModel: targetModel,
    role: invitedRole,
  });

  // 6. Notify Invitee
  await createNotificationWithActions({
    recipient: invitee._id,
    sender: userId,
    type: targetModel === "Team" ? "TEAM_INVITE" : "ORG_INVITE",
    title: `New Invitation`,
    message: `You have been invited to join ${target.name || target.teamName} as ${invitedRole}.`,
    relatedData: { inviteId: invitation._id, targetId },
    actions: [
      { label: "Accept", actionType: "ACCEPT", payload: { inviteId: invitation._id } },
      { label: "Reject", actionType: "REJECT", payload: { inviteId: invitation._id } }
    ]
  });

  res.status(201).json({
    success: true,
    message: "Invitation sent successfully",
    data: invitation,
  });
});

/**
 * @desc Respond to Invitation (Accept/Reject)
 */
export const respondToInvitation = TryCatchHandler(async (req, res) => {
  const { invitationId } = req.params;
  const { action } = req.body; // 'accepted' or 'rejected'
  const { userId } = req.user;

  const invite = await Invitation.findById(invitationId).populate("entityId");
  if (!invite) throw new AppError("Invitation not found", 404);

  if (invite.receiver.toString() !== userId.toString()) {
    throw new AppError("Access Denied", 403);
  }

  if (invite.status !== "pending") {
    throw new AppError(`Invitation already ${invite.status}`, 400);
  }

  if (action === "accepted") {
    const user = await User.findById(userId);

    if (invite.entityModel === "Team") {
      if (user.teamId) throw new AppError("You are already in a team", 400);

      // Update User
      user.teamId = invite.entityId._id;
      user.roles.push({
        scope: Scopes.TEAM,
        role: invite.role,
        scopeId: invite.entityId._id,
        scopeModel: "Team"
      });

      // Update Team Roster (Fix: actually add them to the team document)
      await Team.findByIdAndUpdate(invite.entityId._id, {
        $push: {
          teamMembers: {
            user: user._id,
            roleInTeam: invite.role === "team:captain" ? "igl" : "player"
          }
        }
      });
    } else if (invite.entityModel === "Organizer") {
      if (user.orgId) throw new AppError("You are already in an organization", 400);

      user.orgId = invite.entityId._id;
      user.roles.push({
        scope: Scopes.ORG,
        role: invite.role,
        scopeId: invite.entityId._id,
        scopeModel: "Organizer"
      });
    }

    await user.save();
  }

  invite.status = action === "accepted" ? "accepted" : "rejected";
  await invite.save();

  res.status(200).json({
    success: true,
    message: `Invitation ${action} successfully`,
  });
});

/**
 * @desc Get all pending invitations for a specific entity (Team or Organizer)
 */
export const getPendingInvitesForEntity = TryCatchHandler(async (req, res) => {
  const { orgId, teamId } = req.params;
  const entityId = orgId || teamId;

  if (!entityId) {
    throw new AppError("Entity ID is required", 400);
  }

  const invitations = await Invitation.find({
    entityId,
    status: "pending",
  })
    .populate("receiver", "username email avatar")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    data: invitations,
  });
});

/**
 * @desc Cancel a pending invitation
 */
export const cancelInvitation = TryCatchHandler(async (req, res) => {
  const { inviteId } = req.params;

  const invitation = await Invitation.findById(inviteId);
  if (!invitation) {
    throw new AppError("Invitation not found", 404);
  }

  if (invitation.status !== "pending") {
    throw new AppError(`Cannot cancel an invitation that is already ${invitation.status}`, 400);
  }

  // Note: RBAC middleware should handle authorization before reaching here,
  // ensuring the user has rights to manage this entity's invitations.

  await Invitation.findByIdAndDelete(inviteId);

  // Synchronize with notifications: Archive the related notification
  try {
    await Notification.updateMany(
      { "relatedData.inviteId": inviteId },
      {
        $set: {
          status: "archived",
          "content.message": "This invitation has been cancelled by the sender."
        },
        $unset: { actions: "" } // Remove actions so user can't click them
      }
    );
  } catch (notifyError) {
    logger.error("[CancelInvite Notification Sync Error]:", notifyError);
    // We don't fail the request if notification sync fails
  }

  res.status(200).json({
    success: true,
    message: "Invitation cancelled successfully",
  });
});
