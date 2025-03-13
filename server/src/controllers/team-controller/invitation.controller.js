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

// export const getUserInvitations = async (req, res) => {
//   try {
//     const userId = req.user._id; // Authenticated user ID

//     // Find invitations where the user is the receiver
//     const invitations = await Invitation.find({ receiver: userId })
//       .populate("teamId", "teamName") // Populate team details
//       .populate("sender", "username email") // Populate sender details
//       .exec();

//     res.status(200).json({ success: true, invitations });
//   } catch (error) {
//     console.error("Error fetching user invitations:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

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

// export const respondToInvite = async (req, res) => {
//   try {
//     const { invitationId } = req.params;
//     const { status } = req.body;
//     const userId = req.user._id;

//     console.log(invitationId);

//     // Validate status
//     if (!["accepted", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     console.log("Invitation ID:", invitationId);
//     console.log("User ID:", userId);

//     // Find the invite
//     const invitation = await Invitation.findById(invitationId).populate(
//       "teamId"
//     );

//     if (!invitation) {
//       return res.status(404).json({ message: "Invite not found" });
//     }

//     // Validate user authorization
//     if (invitation.receiver.toString() !== userId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "You are not authorized to respond to this invite" });
//     }

//     // Validate invite status (prevent double responses)
//     if (invitation.status !== "pending") {
//       return res
//         .status(400)
//         .json({ message: "Invite has already been responded to" });
//     }

//     // Update the invite status
//     invitation.status = status;
//     await invite.save();

//     if (status === "accepted") {
//       // Create a team member record
//       const teamMember = new TeamMember({
//         teamId: invite.teamId._id,
//         userId: userId,
//       });
//       await teamMember.save();

//       //Create notification for the team owner.
//       const team = await Team.findById(invite.teamId._id);
//       const ownerNotification = new Notification({
//         userId: team.ownerId,
//         message: `${req.user.username} has accepted your invite to join team ${team.name}.`,
//         type: "team_update",
//         relatedId: invite.teamId._id,
//       });
//       await ownerNotification.save();
//     }

//     // Continue with the rest of the logic...
//   } catch (error) {
//     console.error("Error accepting invitation:", error);
//     res.status(500).json({ message: "Error accepting invitation", error });
//   }
// };

export const acceptInvite = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id;

    // Find the Invitation
    const invitation = await Invitation.findById(invitationId);

    if (!invitation || invitation.receiver.toString() !== userId.toString()) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or unauthorized",
      });
    }

    // Find the team
    const team = await Team.findById(invitation.teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Check if user already in a team
    const existingUser = await User.findById(userId);
    if (existingUser.activeTeam) {
      return res
        .status(400)
        .json({ success: false, message: "You are already in a team." });
    }

    // Update the user activeTeam filed
    existingUser.activeTeam = team._id;
    await existingUser.save();

    // Add member into a team
    team.members.push({ userId, role: "player" });
    await team.save();

    // Delete the Invitation from DB
    await Invitation.findByIdAndDelete(invitation._id);

    // Notification Create
    const notification = new TeamNotification({
      user: invitation.sender,
      type: "accept",
      message: `${
        req.user.name || req.user.username
      } has accepted your team invite.`,
      relatedId: team._id,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully.",
      invitation,
      notification,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const rejectInvite = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id;

    // Invitation find karo
    const invitation = await Invitation.findById(invitationId);

    if (!invitation || invitation.receiver.toString() !== userId.toString()) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or unauthorized",
      });
    }

    // Invitation delete karo
    await Invitation.findByIdAndDelete(invitationId);

    // Notification Create
    const notification = new TeamNotification({
      user: invitation.sender,
      type: "reject",
      message: `${
        req.user.name || req.user.username
      } has rejected your team invite.`,
      relatedId: invitationId,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Invitation rejected successfully.",
      notification,
    });
  } catch (error) {
    console.error("Error rejecting invite:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// option for future

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
