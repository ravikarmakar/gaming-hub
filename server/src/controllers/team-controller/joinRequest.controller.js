import mongoose from "mongoose";
import TeamNotification from "../../models/notification-model/team.notification.model.js";
import JoinRequest from "../../models/team-model/joinRequest.model.js";
import Team from "../../models/team.model.js";
import User from "../../models/user.model.js";

export const getAllJoinRequest = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const joinRequests = await JoinRequest.find({
      $or: [{ senderId: loggedInUser._id }, { receivedBy: loggedInUser._id }],
    })
      .populate("teamId", "teamName") // Get team details
      .populate("senderId", "username email") // Get sender details
      .populate("receivedBy", "username email") // Get receiver details
      .sort({ createdAt: -1 }); // Sort by latest invitations

    res.status(200).json({
      success: true,
      joinRequests,
    });
  } catch (error) {
    console.log("Error in getAllJoinRequest:", error);
    res.status(500).json({ success: false, message: "Internal server Errro" });
  }
};

// Player can send join Request to team
export const requestToJoinTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const loggedInUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Team ID" });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found." });
    }

    // Check if team has reached max capacity
    const MAX_TEAM_SIZE = 6; // Set your max team size
    if (team.members.length >= MAX_TEAM_SIZE) {
      return res.status(400).json({
        success: false,
        message: "This team is already full.",
      });
    }

    // Check if player is already in another team
    if (loggedInUser.activeTeam) {
      return res
        .status(400)
        .json({ success: false, message: "You are already in another team." });
    }

    // Check if the player is already the Owner or Captain of this team
    if (
      team?.captain?.equals(loggedInUser._id) ||
      team?.owner?.equals(loggedInUser._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Captain or Owner can't send join request",
      });
    }

    // Check if the request already exists
    const existingRequest = await JoinRequest.findOne({
      teamId: team._id,
      senderId: loggedInUser._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this team.",
      });
    }

    // Create a new join request
    const newJoinRequest = new JoinRequest({
      teamId: team._id,
      senderId: loggedInUser._id,
      receivedBy: team.owner,
      status: "pending",
    });

    await newJoinRequest.save();

    // Notify the team owner
    const notification = new TeamNotification({
      user: team.owner,
      type: "join_request",
      status: "unread",
      message: `${loggedInUser.name} requested to join your team: ${team.teamName}.`,
      relatedId: newJoinRequest._id,
    });

    await notification.save();

    // Increment owner's notification count
    await User.findByIdAndUpdate(team.owner, {
      $inc: { notificationCount: 1 },
    });

    // Emit real-time notification (if WebSocket is implemented)

    res.status(201).json({
      success: true,
      message: "Join request sent successfully.",
      joinRequest: newJoinRequest,
      notification,
    });
  } catch (error) {
    console.error("Error requesting to join team:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Owner & Captain can respond this Request
export const respondToJoinRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const loggedInUser = req.user;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, message: "Action is required." });
    }

    // Find the Join Request
    const joinRequest = await JoinRequest.findOne({
      receivedBy: loggedInUser._id,
    });

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: "Join Request not found or unauthorized.",
      });
    }

    console.log(joinRequest);

    // Find the User
    const userToJoin = await User.findById(joinRequest.senderId);
    if (!userToJoin) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Find the Team and its Owner
    const team = await Team.findById(joinRequest.teamId).populate("owner");
    console.log(team);

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found." });
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
    if (userToJoin.activeTeam) {
      return res
        .status(400)
        .json({ success: false, message: "User is already in a team." });
    }

    const ownerName = loggedInUser.name || "Team Owner";

    let message = "";
    let joinRequestType = action === "accept" ? "accept" : "reject";

    if (action === "accept") {
      // Update user's active team
      userToJoin.activeTeam = team._id;
      await userToJoin.save();

      // Add user to team members
      team.members.push({ userId: userToJoin._id, role: "player" });
      await team.save();

      message = `${ownerName} has accepted your join request. Welcome to the team!`;
    } else {
      message = `${ownerName} has rejected your join request.`;
    }

    // Delete the join request
    joinRequest.status = action === "accept" ? "accepted" : "rejected";
    await joinRequest.save();

    // Create a notification
    const notification = new TeamNotification({
      user: userToJoin._id,
      type: joinRequestType,
      status: "unread",
      message,
      relatedId: team._id,
    });

    await notification.save();

    // Increment sender's notification count
    await User.findByIdAndUpdate(joinRequest.senderId, {
      $inc: { notificationCount: 1 },
    });

    res.status(200).json({
      success: true,
      message: `Join request ${action}ed successfully`,
      notification,
    });
  } catch (error) {
    console.error("Error responding to join request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while responding to the join request.",
    });
  }
};
