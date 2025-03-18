import TeamNotification from "../../models/notification-model/team.notification.model.js";
import User from "../../models/user.model.js";

export const getNotifications = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const notifications = await TeamNotification.find({
      user: loggedInUser._id,
    }).sort({
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
    const loggedInUser = req.user;

    // Check if there are unread notifications
    const unreadCount = await TeamNotification.countDocuments({
      user: loggedInUser._id,
      status: "unread",
    });

    if (unreadCount === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "All notifications are already read.",
        });
    }

    // Mark notifications as read
    await TeamNotification.updateMany(
      { user: loggedInUser._id, status: "unread" },
      { $set: { status: "read" } }
    );

    // Reset notification count
    await User.findByIdAndUpdate(loggedInUser._id, {
      $set: { notificationCount: 0 },
    });

    res.status(200).json({
      success: true,
      message: "Notifications marked as read.",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating notification status.",
    });
  }
};
