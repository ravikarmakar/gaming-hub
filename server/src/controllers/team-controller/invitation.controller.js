import Invitation from "../../models/team-model/invitation.model.js";
import Team from "../../models/team.model.js";
import TeamNotification from "../../models/notification-model/team.notification.model.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";

export const getAllInvitations = async (req, res) => {
  try {
    const loggedInUser = req.user; // Current logged-in user

    // Find all invitations where user is either sender or receiver
    const invitations = await Invitation.find({
      $or: [{ sender: loggedInUser._id }, { receiver: loggedInUser._id }],
    })
      .populate("teamId", "teamName") // Get team details
      .populate("sender", "username email") // Get sender details
      .populate("receiver", "username email") // Get receiver details
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

// option for future
export const responseToInvite = async (req, res) => {
  try {
    const { action } = req.body;
    const loggedInUser = req.user;

    // Find invitation for the specified team
    const invitation = await Invitation.findOne({
      receiver: loggedInUser._id,
      status: "pending",
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or unauthorized",
      });
    }

    // Check if user has already accepted another team invite
    const existingAcceptedInvite = await Invitation.findOne({
      receiver: loggedInUser._id,
      status: "accepted",
    });

    if (existingAcceptedInvite) {
      return res.status(400).json({
        success: false,
        message: "You have already joined another team.",
      });
    }

    // Check if invitation has expired
    // if (invitation.expireDate && invitation.expireDate < new Date()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This invitation has expired.",
    //   });
    // }

    let message = "";
    let type = "";

    if (action === "accept") {
      // Find the team
      const team = await Team.findById(invitation.teamId);
      if (!team) {
        return res
          .status(404)
          .json({ success: false, message: "Team not found" });
      }

      // Check if team has reached max capacity
      const MAX_TEAM_SIZE = 6; // Set your max team size
      if (team.members.length >= MAX_TEAM_SIZE) {
        return res.status(400).json({
          success: false,
          message: "This team is already full.",
        });
      }

      // Check if user is already in a team
      if (loggedInUser.activeTeam) {
        return res.status(400).json({
          success: false,
          message: "You are already in a team.",
        });
      }

      // Assign team to user & add to team members
      loggedInUser.activeTeam = team._id;
      team.members.push({ userId: loggedInUser._id, role: "player" });

      await loggedInUser.save();
      await team.save();

      message = `${loggedInUser.name} has accepted your team invite.`;
      type = "accept";
    } else if (action === "reject") {
      message = `${loggedInUser.name} has rejected your team invite.`;
      type = "reject";
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action." });
    }

    // Create notification
    const notification = await TeamNotification.create({
      user: invitation.sender,
      type,
      status: "unread",
      message,
      relatedId: invitation.teamId,
    });

    await User.findByIdAndUpdate(invitation.sender, {
      $inc: { notificationCount: 1 },
    });

    // Save invitation and update status
    invitation.status = action === "accept" ? "accepted" : "rejected";
    await invitation.save();

    res.status(200).json({
      success: true,
      message: `Invitation ${action}ed successfully.`,
      notification,
      invitation,
    });
  } catch (error) {
    console.error(`Error ${req.body.action}ing invite:`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Owner and Captain can invite only
export const inviteMemberInTeam = async (req, res) => {
  try {
    const loggedInUser = req.user;
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
    const team = await Team.findOne({ _id: loggedInUser.activeTeam });
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Check if team has reached max capacity
    const MAX_TEAM_SIZE = 6; // Set your max team size
    if (team.members.length >= MAX_TEAM_SIZE) {
      return res.status(400).json({
        success: false,
        message: "This team is already full.",
      });
    }

    // Only Captain or Owner can send invites
    const isAuthorized =
      team.owner?.equals(loggedInUser._id) ||
      team.captain?.equals(loggedInUser._id);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Only the Captain or Owner can invite players.",
      });
    }

    // Captain & Owner can't send request to themselves
    if (userToInvite._id.equals(loggedInUser._id)) {
      return res.status(403).json({
        success: false,
        message: "You can't send a request to yourself.",
      });
    }

    // Check if Player is already in another team
    if (userToInvite.activeTeam) {
      return res.status(409).json({
        success: false,
        message: "Player is already in another team.",
      });
    }

    // Check if the player is already in the team
    const isMember = team.members.some(
      (member) => member.userId && member.userId.equals(userToInvite._id)
    );
    if (isMember) {
      return res
        .status(400)
        .json({ success: false, message: "Player is already in the team." });
    }

    // Check if an invite is already pending
    const existingInvite = await Invitation.findOne({
      teamId: team._id,
      receiver: userToInvite._id,
      status: "pending",
    });
    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: "Invite already pending for this user.",
      });
    }

    // Create new invitation
    const newInvitation = new Invitation({
      teamId: team._id,
      receiver: userToInvite._id,
      sender: loggedInUser._id,
      status: "pending",
    });
    await newInvitation.save();

    // Create Notification for the invited player
    const notification = new TeamNotification({
      user: userToInvite._id,
      type: "invite",
      status: "unread",
      message: `You have been invited to join team "${team.teamName}" by ${loggedInUser.name}.`,
      relatedId: newInvitation._id,
    });
    await notification.save();

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
