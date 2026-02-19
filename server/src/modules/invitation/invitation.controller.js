import Invitation from "../invitation/invitation.model.js";
import User from "../user/user.model.js";
import { Notification } from "../notification/notification.model.js";
import { Roles } from "../../shared/constants/roles.js";
import { createNotificationWithActions } from "../notification/notification.service.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import AppError from "../../shared/utils/AppError.js";
import { logger } from "../../shared/utils/logger.js";
import { getStrategy } from "../join-request/target.strategy.js";

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

  // 1. Resolve Strategy
  const strategy = getStrategy(targetModel);

  // 2. Find Invitee (Support both Email and ID)
  let inviteeId = playerId || inputUserId;
  let invitee = null;

  if (inviteeId) {
    invitee = await User.findById(inviteeId);
  } else if (email) {
    invitee = await User.findOne({ email: email.toLowerCase() });
  }

  if (!invitee) throw new AppError("User not found to invite", 404);
  inviteeId = invitee._id;

  // 3. Delegate specific checks to Strategy
  const { resource } = await strategy.validateInvitation(userId, inviteeId, targetId);

  // 4. Check for duplicate invitation (Generic logic)
  const existingInvite = await Invitation.findOne({
    entityId: targetId,
    receiver: inviteeId,
    status: "pending"
  });
  if (existingInvite) throw new AppError("Invitation already sent to this user", 400);

  // 5. Create Invitation
  const invitedRole = role || (targetModel === "Team" ? Roles.TEAM.PLAYER : Roles.ORG.STAFF);

  const invitation = await Invitation.create({
    sender: userId,
    receiver: inviteeId,
    receiverModel: "User",
    entityId: targetId,
    entityModel: targetModel,
    role: invitedRole,
  });

  // 6. Notify Invitee
  await createNotificationWithActions({
    recipient: inviteeId,
    sender: userId,
    type: targetModel === "Team" ? "TEAM_INVITE" : "ORGANIZATION_INVITE",
    title: `New Invitation`,
    message: `You have been invited to join ${resource?.name || resource?.teamName || "Unknown Resource"} as ${invitedRole}.`,
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
    const { acceptInvitationService } = await import("./invitation.service.js");
    const message = await acceptInvitationService(invitationId, userId);

    return res.status(200).json({
      success: true,
      message,
    });
  } else {
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

  const { orgId, teamId } = req.params;
  const entityId = orgId || teamId;

  if (entityId && invitation.entityId.toString() !== entityId.toString()) {
    throw new AppError("You do not have permission to cancel this invitation", 403);
  }

  await Invitation.findByIdAndDelete(inviteId);

  try {
    await Notification.updateMany(
      { "relatedData.inviteId": inviteId },
      {
        $set: {
          status: "archived",
          "content.message": "This invitation has been cancelled by the sender."
        },
        $unset: { actions: "" }
      }
    );
  } catch (notifyError) {
    logger.error("[CancelInvite Notification Sync Error]:", notifyError);
  }

  res.status(200).json({
    success: true,
    message: "Invitation cancelled successfully",
  });
});
