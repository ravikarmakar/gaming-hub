import Invitation from "../models/invitation.model.js";
import Team from "../models/team.model.js";
import { Notification } from "../models/notification.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getAllInvitations = async (req, res) => {
  try {
    const loggedInUser = req.user; // Current logged-in user

    // Find all invitations where user is either sender or receiver
    const invitations = await Invitation.find({
      $or: [{ sender: loggedInUser._id }, { receiver: loggedInUser._id }],
    })
      .populate("entityId") // Get entity details (polymorphic)
      .populate("sender", "username email") // Get sender details
      .populate("receiver") // Get receiver details (polymorphic)
      .sort({ createdAt: -1 }); // Sort by latest invitations

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Owner and Captain can invite only
export const inviteMemberInTeam = async (req, res) => {
  try {
    const userId = req.user._id;
    const { playerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Player ID" });
    }

    // Validate that the user to be invited exists
    const userToInvite = await User.findById(playerId);
    if (!userToInvite) {
      return res
        .status(404)
        .json({ success: false, message: "User to Invite not found" });
    }

    // Ensure the team exists
    const userCaller = await User.findById(userId);
    if (!userCaller || !userCaller.teamId) {
      return res.status(404).json({ success: false, message: "You are not in a team" });
    }
    const teamToInviteFrom = await Team.findById(userCaller.teamId);
    if (!teamToInviteFrom) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    // Check if team has reached max capacity
    const MAX_TEAM_SIZE = 6;
    if (teamToInviteFrom.teamMembers.length >= MAX_TEAM_SIZE) {
      return res.status(400).json({
        success: false,
        message: "This team is already full.",
      });
    }

    // Only Captain or Owner can send invites
    const isAuthorized =
      teamToInviteFrom.owner?.equals(userId) ||
      teamToInviteFrom.captain?.equals(userId);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Only the Captain or Owner can invite players.",
      });
    }

    // Captain & Owner can't send request to themselves
    if (userToInvite._id.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can't send a request to yourself.",
      });
    }

    // Check if Player is already in another team
    if (userToInvite.teamId) {
      return res.status(409).json({
        success: false,
        message: "Player is already in another team.",
      });
    }

    // Check if the player is already in the team
    const isMember = teamToInviteFrom.teamMembers.some(
      (member) => member.user && member.user.equals(userToInvite._id)
    );
    if (isMember) {
      return res
        .status(400)
        .json({ success: false, message: "Player is already in the team." });
    }

    // Check if an invite is already pending
    const existingInvite = await Invitation.findOne({
      entityId: teamToInviteFrom._id,
      entityModel: "Team",
      receiver: userToInvite._id,
      receiverModel: "User",
      status: "pending",
    });
    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: "Invite already pending for this user.",
      });
    }

    // Create new invitation
    const { message } = req.body;
    const newInvitation = new Invitation({
      entityId: teamToInviteFrom._id,
      entityModel: "Team",
      receiver: userToInvite._id,
      receiverModel: "User",
      sender: userId,
      status: "pending",
      message: message || "",
    });
    await newInvitation.save();

    // Create Notification for the invited player using the new system
    await Notification.create({
      recipient: userToInvite._id,
      sender: userCaller._id,
      type: "TEAM_INVITE",
      content: {
        title: "Team Invitation",
        message: `You have been invited to join team "${teamToInviteFrom.teamName}" by ${userCaller.username}.`,
      },
      status: "unread",
      relatedData: {
        teamId: teamToInviteFrom._id,
        inviteId: newInvitation._id,
      },
      actions: [
        { label: "Accept", actionType: "ACCEPT", payload: { teamId: teamToInviteFrom._id, inviteId: newInvitation._id, role: "player" } },
        { label: "Reject", actionType: "REJECT", payload: { teamId: teamToInviteFrom._id, inviteId: newInvitation._id } },
      ]
    });

    await User.findByIdAndUpdate(userToInvite._id, {
      $inc: { notificationCount: 1 },
    });

    // Emit WebSocket Event for real-time notification (if using sockets)
    // io.to(playerId).emit("newNotification", notification);

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully.",
      newInvitation,
    });
  } catch (error) {
    console.error("Error inviting player:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
