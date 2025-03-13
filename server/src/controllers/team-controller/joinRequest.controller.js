import TeamNotification from "../../models/notification-model/team.notification.model.js";
import JoinRequest from "../../models/team-model/joinRequest.model.js";
import Team from "../../models/team.model.js";
import User from "../../models/user.model.js";

export const getAllJoinRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    // return console.log(userId);

    const joinRequests = await JoinRequest.find({
      $or: [{ senderId: userId }, { receivedBy: userId }],
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
}; // working

export const respondToJoinRequest = async (req, res) => {
  try {
    const { requestedId } = req.params;
    const { response } = req.body;
    const userId = req.user._id;

    // Check if response is not Empty
    if (!response) {
      return res.status(400).json({ message: "Fill all the fields" });
    }

    // Find the JoinRequest
    const joinRequest = await JoinRequest.findById(requestedId);
    if (
      !joinRequest ||
      joinRequest.receivedBy.toString() !== userId.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Join Request not found or unauthorized",
      });
    }

    // Find the User
    const user = await User.findById(joinRequest.senderId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    // Find the team
    const team = await Team.findById(joinRequest.teamId).populate("owner");

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Check if user already in a team
    if (user.activeTeam) {
      return res
        .status(400)
        .json({ success: false, message: "You are already in a team" });
    }

    // Find the team owner
    const owner = await User.findById(team.owner);
    const ownerName = owner ? owner.username : "Team Owner";

    let message = "";

    // Runs when Owner accepts the request
    if (response === "accepted") {
      // update the user activeTeam field
      user.activeTeam = team._id;
      await user.save();

      // Add this user into the team
      team.members.push({ userId: user._id, role: "player" });
      await team.save();

      // Delete the joinRequest from DB
      await JoinRequest.findByIdAndDelete(joinRequest._id);

      // Create a custom message for the user
      message = `${ownerName} has accepte your join request. Welcome to the team!`;
    } else {
      // Delete the join request
      await JoinRequest.findByIdAndDelete(joinRequest._id);
      message = `${ownerName} has rejecte your join request.`;
    }

    // Create notification for user
    const notification = new TeamNotification({
      user: joinRequest.senderId,
      type: "accept",
      message,
      relatedId: team._id,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message,
      notification,
    });
  } catch (error) {
    console.error("Error responding to join request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server error while responding to invite.",
    });
  }
}; // working
