import Team from "../models/team.model.js";
import TeamNotification from "../models/notification-model/team.notification.model.js";
import Request from "../models/team-model/joinRequest.model.js";
import Invitation from "../models/team-model/invitation.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate("captain", "username email") // Populate captain details S
      .populate("members.userId", "username email"); // Populate team members

    res.status(200).json({ message: "Get all teams successfully", teams });
  } catch (error) {
    console.error(`Error in getAllTeams : ${error.message}`);
    res.status(500).json({ message: "Server error while getting all teams" });
  }
}; // works

export const getOneTeam = async (req, res) => {
  const { teamId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Event ID" });
  }

  try {
    const team = await Team.findById(teamId)
      .populate("captain", "username email") // Populate captain details S
      .populate("members.userId", "username email"); // Populate team members
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, team });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}; // works

export const createTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Team createor Id", userId);

    const { teamName } = req.body;

    if (!teamName) {
      return res
        .status(400)
        .json({ success: false, message: "Team name is required." });
    }

    // Prevent user from creating multiple teams
    const user = await User.findById(userId);
    if (user.activeTeam) {
      return res.status(400).json({
        success: false,
        message: "You have already created a team.",
      });
    }

    // Check if team with the same name exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res
        .status(400)
        .json({ success: false, message: "Team name already exists." });
    }

    const newTeam = new Team({
      teamName,
      owner: userId,
      captain: userId,
    });

    const savedTeam = await newTeam.save();

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          activeTeam: savedTeam._id,
          isCaptain: true,
        },
        $inc: {
          createdTeamCount: 1,
        },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: savedTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}; // works

export const deleteTeam = async (req, res) => {
  const { teamId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json({ success: false, message: "Invalid Team ID" });
  }

  try {
    const team = await Team.findByIdAndDelete(teamId);

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    const memberIds = team.members.map((member) => member.userId);

    // Notify members
    // for (const member of team.members) {
    //   await TeamNotification.create({
    //     user: member.userId,
    //     type: "announcement",
    //     message: `Your team ${team.teamName} has been deleted.`,
    //     relatedId: teamId,
    //   });
    // }

    await User.updateMany(
      { _id: { $in: [...memberIds, team.owner, team.captain] } },
      {
        $unset: { activeTeam: "", teamRole: "" },
        $set: { isCaptain: false },
      }
    );

    await Team.findByIdAndDelete(teamId);
    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error(`Error in deleteTeam : ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting team" });
  }
  console.log(teamId);
}; // mostly works

// Invite a player to a team by Owner and Captain
export const invitePlayer = async (req, res) => {
  try {
    const { teamId } = req.params; // Team ID from URL params
    const { playerId } = req.body; // Invited user's ID
    const captainId = req.user._id; // Current logged-in user (Captain/Owner)
    const senderName = req.user.name || req.user.username; // Ensure name exists

    // Ensure the team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Only Captain or Owner can send invites
    const isAuthorized =
      team.owner?.toString() === captainId.toString() ||
      team.captain?.toString() === captainId.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Only the Captain or Owner can invite players.",
      });
    }

    // Check if the player is already in the team
    const isMember = team.members.some(
      (member) => member.userId.toString() === playerId
    );
    if (isMember) {
      return res
        .status(400)
        .json({ success: false, message: "Player is already in the team" });
    }

    // Create new invitation
    const newInvitation = new Invitation({
      teamId: teamId,
      sender: captainId,
      receiver: playerId,
      status: "pending",
    });

    await newInvitation.save();

    // Create Notification for the invited player
    const notification = new TeamNotification({
      user: playerId,
      type: "invite",
      message: `You have been invited to join team "${team.teamName}" by ${senderName}.`,
      relatedId: newInvitation._id,
    });

    await notification.save();

    // Emit WebSocket Event for real-time notification (if using sockets)
    // io.to(playerId).emit("newNotification", notification);

    res
      .status(201)
      .json({ success: true, message: "Invitation sent successfully." });
  } catch (error) {
    console.error("Error inviting player:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}; // mostly work

//
//
//
//
///
//
//
//

////
//
//
///
//
////
//
////

export const acceptInvite2 = async (req, res) => {
  try {
    const { requestId } = req.params;
    const playerId = req.user._id;

    // Find the invite request
    const request = await Request.findOne({
      _id: requestId,
      receiverId: playerId,
      type: "invite",
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Invite not found or already processed",
      });
    }

    // Add player to the team
    const team = await Team.findById(request.teamId);
    if (team.members.length >= team.maxPlayers) {
      return res
        .status(400)
        .json({ success: false, message: "Team is already full" });
    }
    team.members.push({ userId: playerId, role: "player" });
    await team.save();

    // Update the request status
    request.status = "accepted";
    await request.save();

    // Notify the captain
    const notification = new TeamNotification({
      from: team.captainId,
      to: playerId,
      message: `Player accepted your invitation to join team: ${team.teamName}.`,
    });
    await notification.save();

    res.status(200).json({ success: true, message: "Invite accepted", team });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const requestToJoinTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const playerId = req.user._id;

    // Check if the request already exists
    const existingRequest = await Request.findOne({
      teamId,
      senderId: playerId,
      type: "join",
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this team",
      });
    }

    // Create a new join request
    const newRequest = new Request({
      teamId,
      senderId: playerId,
      receiverId: (await Team.findById(teamId)).captainId,
      type: "join",
    });
    await newRequest.save();

    // Notify the captain
    const notification = new Notification({
      userId: newRequest.receiverId,
      message: `Player requested to join your team: ${teamId}.`,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "Join request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error requesting to join team:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const respondToInvite = async (req, res) => {
  try {
    const { invitationId, response } = req.body; // response = "accepted" | "rejected"
    const userId = req.user._id; // Current logged-in user

    const invitation = await Invitation.findById(invitationId).populate("team");
    if (!invitation)
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found." });

    // Check if the user is the receiver
    if (invitation.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to respond to this invitation.",
      });
    }

    let message = "";
    if (response === "accepted") {
      // Add user to the team
      await Team.findByIdAndUpdate(invitation.team._id, {
        $push: { members: { userId, role: "player" } },
      });

      // Update user's active team
      await User.findByIdAndUpdate(userId, {
        activeTeam: invitation.team._id,
        teamRole: "player",
      });

      invitation.status = "accepted";
      message = `${req.user.username} has accepted your team invitation.`;
    } else {
      invitation.status = "rejected";
      message = `${req.user.username} has rejected your team invitation.`;
    }

    await invitation.save();

    // Create Notification for Captain/Owner**
    const notification = new TeamNotification({
      user: invitation.sender, // Captain/Owner
      type: "invite",
      message,
      relatedId: invitation._id,
    });

    await notification.save();

    res.status(200).json({ success: true, message: `Invitation ${response}.` });
  } catch (error) {
    console.error("Error responding to invite:", error);
    res.status(500).json({
      success: false,
      message: "Server error while responding to invite.",
    });
  }
};
export const respondToInvite2 = async (req, res) => {
  try {
    const { invitationId, response } = req.body; // response = "accepted" | "rejected"
    const userId = req.user._id; // Current logged-in user

    const invitation = await Invitation.findById(invitationId).populate("team");
    if (!invitation)
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found." });

    // Check if the user is the receiver
    if (invitation.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to respond to this invitation.",
      });
    }

    let message = "";
    if (response === "accepted") {
      // Add user to the team
      await Team.findByIdAndUpdate(invitation.team._id, {
        $push: { members: { userId, role: "player" } },
      });

      // Update user's active team
      await User.findByIdAndUpdate(userId, {
        activeTeam: invitation.team._id,
        teamRole: "player",
      });

      invitation.status = "accepted";
      message = `${req.user.username} has accepted your team invitation.`;
    } else {
      invitation.status = "rejected";
      message = `${req.user.username} has rejected your team invitation.`;
    }

    await invitation.save();

    // ✅ **Create Notification for Captain/Owner**
    const notification = new TeamNotification({
      user: invitation.sender, // Captain/Owner
      type: "invite",
      message,
      relatedId: invitation._id,
    });

    await notification.save();

    res.status(200).json({ success: true, message: `Invitation ${response}.` });
  } catch (error) {
    console.error("Error responding to invite:", error);
    res.status(500).json({
      success: false,
      message: "Server error while responding to invite.",
    });
  }
};
export const leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Check if user is in the team
    const isMember = team.members.find(
      (member) => member.userId.toString() === userId.toString()
    );
    if (!isMember) {
      return res
        .status(400)
        .json({ success: false, message: "You are not in this team" });
    }

    // Remove user from team
    await Team.findByIdAndUpdate(teamId, {
      $pull: { members: { userId } },
    });

    // Update user schema
    await User.findByIdAndUpdate(userId, {
      activeTeam: null,
      teamRole: null,
    });

    // Notify owner
    await TeamNotification.create({
      user: team.owner,
      type: "announcement",
      message: `${req.user.username} has left the team.`,
      relatedId: teamId,
    });

    res.status(200).json({ success: true, message: "You left the team." });
  } catch (error) {
    console.error("Error leaving team:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
