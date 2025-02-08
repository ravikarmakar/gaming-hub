import Team from "../models/team.model.js";
import Notification from "../models/notification.model.js";
import Request from "../models/team-model/request.model.js";
import mongoose from "mongoose";

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({}).populate("user");

    res.status(200).json({ message: "Get all teams successfully", teams });
  } catch (error) {
    console.error(`Error in getAllTeams : ${error.message}`);
    res.status(500).json({ message: "Server error while getting all teams" });
  }
};

export const getOneTeam = async (req, res) => {
  const { teamId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Event ID" });
  }

  try {
    const team = await Team.findById(teamId);
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
};

export const createTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    const { teamName } = req.body;

    if (!teamName) {
      return res
        .status(400)
        .json({ success: false, message: "Team name is required." });
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
      captain: userId,
    });

    await newTeam.save();
    res.status(201).json({ success: true, team: newTeam });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const invitePlayer = async (req, res) => {
  try {
    const { teamId, playerId } = req.body; // teamId = Team inviting the player, playerId = invited user
    const captainId = req.user._id; // Authenticated captain

    // Ensure the team exists and the captain is valid
    const team = await Team.findOne({ _id: teamId, captainId });
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found or unauthorized" });
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

    // Create a new invite request
    const newRequest = new Request({
      teamId,
      senderId: captainId,
      receiverId: playerId,
      type: "invite",
    });
    await newRequest.save();

    // Send notification to the player
    const notification = new Notification({
      from: captainId,
      to: playerId,
      message: `You have been invited to join the team: ${team.teamName}.`,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "Invite sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error inviting player:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const acceptInvite = async (req, res) => {
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
    const notification = new Notification({
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
      return res
        .status(400)
        .json({
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

    res
      .status(201)
      .json({
        success: true,
        message: "Join request sent successfully",
        request: newRequest,
      });
  } catch (error) {
    console.error("Error requesting to join team:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
