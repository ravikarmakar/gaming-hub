import Invitation from "../../models/team-model/invitation.model.js";
import Team from "../../models/team.model.js";
import TeamNotification from "../../models/notification-model/team.notification.model.js";
import User from "../../models/user.model.js";

export const getAllInvitations = async (req, res) => {
  try {
    const userId = req.user._id; // Current logged-in user

    // Find all invitations where user is either sender or receiver
    const invitations = await Invitation.find({
      $or: [{ sender: userId }, { receiver: userId }],
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

export const getUserInvitations = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user ID

    // Find invitations where the user is the receiver
    const invitations = await Invitation.find({ receiver: userId })
      .populate("teamId", "teamName") // Populate team details
      .populate("sender", "username email") // Populate sender details
      .exec();

    res.status(200).json({ success: true, invitations });
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// export const acceptInvite = async (req, res) => {
//   try {
//     const { invitationId } = req.params;
//     const userId = req.user;

//     console.log("Invitation ID:", invitationId);
//     console.log("User ID:", userId);

//     res.status(200).json({ message: "Invitation accepted" });
//   } catch (error) {
//     res.status(500).json({ message: "Error accepting invitation", error });
//   }
// };

export const acceptInvite = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user;

    console.log("Invitation ID:", invitationId);
    console.log("User ID:", userId);

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      console.log("Invitation not found");
      return res.status(404).json({
        success: false,
        message: "Invitation not found or unauthorized",
      });
    }

    if (invitation.receiver.toString() !== userId.toString()) {
      console.log("Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Continue with the rest of the logic...
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ message: "Error accepting invitation", error });
  }
};

// export const acceptInvite = async (req, res) => {
//   try {
//     const { invitationId } = req.params;
//     const userId = req.user;

//     // return console.log(invitationId, userId);

//     // Invitation find karo
//     const invitation = await Invitation.findById(invitationId);
//     if (!invitation || invitation.receiver.toString() !== userId.toString()) {
//       return res.status(404).json({
//         success: false,
//         message: "Invitation not found or unauthorized",
//       });
//     }

//     // Team find karo
//     const team = await Team.findById(invitation.team);
//     if (!team) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Team not found" });
//     }

//     // Check if user already in a team
//     const existingUser = await User.findById(userId);
//     if (existingUser.activeTeam) {
//       return res
//         .status(400)
//         .json({ success: false, message: "You are already in a team." });
//     }

//     // User ka active team update karo
//     existingUser.activeTeam = team._id;
//     existingUser.teamRole = "member"; // Default role
//     await existingUser.save();

//     // Team me member add karo
//     team.members.push({ userId, role: "member" });
//     await team.save();

//     // Invitation delete karo
//     await Invitation.findByIdAndDelete(inviteId);

//     // Notification Create
//     const notification = new TeamNotification({
//       user: invitation.sender,
//       type: "match",
//       message: `${
//         req.user.name || req.user.username
//       } has accepted your team invite.`,
//       relatedId: team._id,
//     });

//     await notification.save();

//     res
//       .status(200)
//       .json({ success: true, message: "Invitation accepted successfully." });
//   } catch (error) {
//     console.error("Error accepting invite:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

export const rejectInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user._id;

    // Invitation find karo
    const invitation = await Invitation.findById(inviteId);
    if (!invitation || invitation.receiver.toString() !== userId.toString()) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or unauthorized",
      });
    }

    // Invitation delete karo
    await Invitation.findByIdAndDelete(inviteId);

    // Notification Create
    const notification = new TeamNotification({
      user: invitation.sender,
      type: "announcement",
      message: `${
        req.user.name || req.user.username
      } has rejected your team invite.`,
      relatedId: inviteId,
    });

    await notification.save();

    res
      .status(200)
      .json({ success: true, message: "Invitation rejected successfully." });
  } catch (error) {
    console.error("Error rejecting invite:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
