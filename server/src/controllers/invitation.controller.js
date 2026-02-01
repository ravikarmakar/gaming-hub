import Invitation from "../models/invitation.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import Organizer from "../models/organizer.model.js";
import { Roles, Scopes } from "../constants/roles.js";
import { createNotificationWithActions } from "../services/notification.service.js";

/**
 * @desc Get all invitations for the logged-in user
 */
export const getAllInvitations = async (req, res) => {
  try {
    const { userId } = req.user;
    const invitations = await Invitation.find({
      receiver: userId,
      status: "pending",
    }).populate("entityId", "name teamName imageUrl avatar").sort("-createdAt");

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Generic Invite logic for Teams and Organizations
 */
export const inviteMember = async (req, res) => {
  try {
    const { email, role, targetId, targetModel, playerId, userId: inputUserId } = req.body;
    const { userId } = req.user;

    // 1. Identify Target
    let target = null;
    if (targetModel === "Team") {
      target = await Team.findById(targetId);
    } else if (targetModel === "Organizer") {
      target = await Organizer.findById(targetId);
    }

    if (!target) return res.status(404).json({ message: `${targetModel} not found or undefined` });

    // 2. Find Invitee (Support both Email and ID)
    let invitee = null;
    const lookupId = playerId || inputUserId;

    if (lookupId) {
      invitee = await User.findById(lookupId);
    } else if (email) {
      invitee = await User.findOne({ email: email.toLowerCase() });
    }

    if (!invitee) return res.status(404).json({ message: "User not found to invite" });

    // 3. Check for existing membership
    if (targetModel === "Team" && invitee.teamId?.toString() === targetId.toString()) {
      return res.status(400).json({ message: "User is already a member of this team" });
    }
    if (targetModel === "Organizer" && invitee.orgId?.toString() === targetId.toString()) {
      return res.status(400).json({ message: "User is already a member of this organization" });
    }

    // 4. Check for duplicate invitation
    const existingInvite = await Invitation.findOne({
      entityId: targetId,
      receiver: invitee._id,
      status: "pending"
    });
    if (existingInvite) return res.status(400).json({ message: "Invitation already sent to this user" });

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
  } catch (error) {
    console.error("[Invite Error]:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Respond to Invitation (Accept/Reject)
 */
export const respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body; // 'accepted' or 'rejected'
    const { userId } = req.user;

    const invite = await Invitation.findById(invitationId).populate("entityId");
    if (!invite) return res.status(404).json({ message: "Invitation not found" });

    if (invite.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access Denied" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: `Invitation already ${invite.status}` });
    }

    if (action === "accepted") {
      const user = await User.findById(userId);

      if (invite.entityModel === "Team") {
        if (user.teamId) return res.status(400).json({ message: "You are already in a team" });

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
        if (user.orgId) return res.status(400).json({ message: "You are already in an organization" });

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
