import Team from "../models/team.model.js";
import TeamNotification from "../models/notification-model/team.notification.model.js";
import JoinRequest from "../models/team-model/joinRequest.model.js";
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

export const getTeamDetails = async (req, res) => {
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

    console.log(teamName);

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

    console.log(user);

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
export const inviteMemberInTeam = async (req, res) => {
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

    // if Player already in Other Team
    if (playerId.activeTeam) {
      return res
        .status(404)
        .json({ success: false, message: "Player already in other team" });
    }

    // Captain & Owner can't send request to itself
    if (
      playerId === team.captain.toString() &&
      playerId === team.owner.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "You can't send request to itself" });
    }

    // Validate that the user to be invited exists
    const userToInvite = await User.findById(playerId);
    if (!userToInvite) {
      return res.status(404).json({ message: "User to invite not found" });
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

    // Check if an invite is already pending
    const existingInvite = await Invitation.findOne({
      teamId: teamId,
      receiver: playerId,
      status: "pending",
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ message: "Invite already pending for this user" });
    }

    // Create new invitation
    const newInvitation = new Invitation({
      teamId: teamId,
      receiver: playerId,
      sender: captainId,
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

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully.",
      newInvitation,
    });
  } catch (error) {
    console.error("Error inviting player:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}; // working

export const memberleaveTeam = async (req, res) => {
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
      // teamRole: null,
    });

    // Notify owner
    await TeamNotification.create({
      user: team.owner,
      type: "team_update",
      message: `${req.user.username} has left the team.`,
      relatedId: teamId,
    });

    res.status(200).json({ success: true, message: "You left the team." });
  } catch (error) {
    console.error("Error leaving team:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}; // working

export const deleteMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Check if the user is the captain or owner
    const isAuthorized =
      team.owner?.toString() === req.user._id.toString() || // Owner
      team.captain?.toString() === req.user._id.toString(); // Captain

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to kick members.",
      });
    }

    // Check if the member to be kicked is in the team
    const isMember = team.members.find(
      (member) => member.userId.toString() === memberId.toString()
    );

    if (!isMember) {
      return res
        .status(400)
        .json({ success: false, message: "Member not found in the team" });
    }

    // Remove member from team
    await Team.findByIdAndUpdate(teamId, {
      $pull: { members: { userId: memberId } },
    });

    // Update user schema
    await User.findByIdAndUpdate(memberId, {
      activeTeam: null,
      // teamRole: null,
    });

    // Notify the kicked member
    await TeamNotification.create({
      user: memberId,
      type: "team_update",
      message: `You have been kicked out of the team by ${req.user.username}.`,
      relatedId: teamId,
    });

    res
      .status(200)
      .json({ success: true, message: "Member kicked successfully" });
  } catch (error) {
    console.error("Error in kicking member:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}; // working

export const requestToJoinTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const playerId = req.user._id;

    // Find the team
    const team = await Team.findById(teamId);

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // if Player already in Other Team
    if (playerId.activeTeam) {
      return res
        .status(404)
        .json({ success: false, message: "You are already in other team" });
    }

    // Check if the sender is alredy an Owner or Captain
    if (
      playerId.toString() === team.captain.toString() &&
      playerId.toString() === team.owner.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can't send join request to in own team",
      });
    }

    // Check if the request already exists
    const existingRequest = await JoinRequest.findOne({
      teamId,
      senderId: playerId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this team",
      });
    }

    // Create a new join request
    const newJoinRequest = new JoinRequest({
      teamId,
      senderId: playerId,
      receivedBy: team.owner,
      relatedId: teamId,
    });
    await newJoinRequest.save();

    // Notify the captain
    const notification = new TeamNotification({
      user: newJoinRequest.receivedBy,
      type: "join_request",
      message: `${req.user.name} requested to join your team: ${team.teamName}.`,
      relatedId: playerId,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "Join request sent successfully",
      joinRequest: newJoinRequest,
      notification,
    });
  } catch (error) {
    console.error("Error requesting to join team:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}; // working
