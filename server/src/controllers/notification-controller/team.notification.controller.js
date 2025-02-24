import TeamNotification from "../../models/notification-model/team.notification.model.js";
import User from "../../models/user.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await TeamNotification.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    await TeamNotification.findByIdAndUpdate(notificationId, {
      status: "read",
    });

    res
      .status(200)
      .json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating notification status.",
    });
  }
};

export const respondToInvite = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { response } = req.body; // "accept" or "reject"

    const notification = await TeamNotification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (response === "accept") {
      const team = await Team.findById(notification.relatedId);
      if (!team) return res.status(404).json({ message: "Team not found" });

      // Check if user already in a team
      const user = await User.findById(req.user.id);
      if (user.activeTeam) {
        return res
          .status(400)
          .json({ message: "You are already in a team. Leave first." });
      }

      // Add user to team
      team.members.push({ userId: req.user.id, role: "player" });
      await team.save();

      // Update user's active team
      user.activeTeam = team._id;
      user.teamRole = "player";
      await user.save();

      res.status(200).json({ message: "You have joined the team" });
    } else {
      res.status(200).json({ message: "Invitation rejected" });
    }

    // Delete notification after response
    await notification.deleteOne();
  } catch (error) {
    console.error("Error responding to invite:", error);
    res.status(500).json({ message: "Server error" });
  }
};
