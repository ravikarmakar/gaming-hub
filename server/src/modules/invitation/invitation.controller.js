import Invitation from "../invitation/invitation.model.js";
import Team from "../team/team.model.js";
import User from "../user/user.model.js";
import Organizer from "../organizer/organizer.model.js";
import { Notification } from "../notification/notification.model.js";
import { Roles } from "../../shared/constants/roles.js";
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

  // 1. Validate and Identify Target
  if (!targetModel || (targetModel !== "Team" && targetModel !== "Organizer")) {
    throw new AppError("Invalid targetModel. Must be 'Team' or 'Organizer'", 400);
  }

  let target = null;
  if (targetModel === "Team") {
    target = await Team.findById(targetId);
  } else if (targetModel === "Organizer") {
    target = await Organizer.findById(targetId);
  }

  if (!target) throw new AppError(`${targetModel} not found`, 404);

  // 1.5 Authorization Check: Ensure sender has permission
  const isAuthorized = targetModel === "Team"
    ? target.captain?.toString() === userId.toString()
    : target.ownerId?.toString() === userId.toString();

  if (!isAuthorized) {
    throw new AppError("You do not have permission to invite members to this " + targetModel, 403);
  }

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
  const invitedRole = role || (targetModel === "Team" ? Roles.TEAM.PLAYER : Roles.ORG.STAFF);

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
    type: targetModel === "Team" ? "TEAM_INVITE" : "ORGANIZATION_INVITE",
    title: `New Invitation`,
    message: `You have been invited to join ${target.name || target.teamName} as ${invitedRole}.`,
    relatedData: {
      inviteId: invitation._id,
      [targetModel === "Team" ? "teamId" : "orgId"]: targetId
    },
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

  // Validate action parameter
  if (!action || (action !== "accepted" && action !== "rejected")) {
    throw new AppError("Invalid action. Must be 'accepted' or 'rejected'", 400);
  }

  const invite = req.invitationDoc;
  const { isReceiver } = req.rbacContext;

  if (!isReceiver) {
    throw new AppError("Access Denied: Only the recipient can respond to this invitation", 403);
  }

  if (invite.status !== "pending") {
    throw new AppError(`Invitation already ${invite.status}`, 400);
  }

  if (action === "accepted") {
    try {
      const { acceptInvitationService } = await import("./invitation.service.js");
      const message = await acceptInvitationService(invitationId, userId);

      return res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      throw error;
    }
  } else {
    // For rejection, no transaction needed but update status
    invite.status = "rejected";
    await invite.save();
  }

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

  // ⚡ Security check: Ensure the invitation belongs to the specified entity (IDOR check)
  const { orgId, teamId } = req.params;
  const entityId = orgId || teamId;

  if (entityId && invitation.entityId.toString() !== entityId.toString()) {
    throw new AppError("You do not have permission to cancel this invitation", 403);
  }

  // Note: RBAC middleware already ensures the user has management rights for the `entityId`.
  // This check confirms the `inviteId` actually belongs to that `entityId`.

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
