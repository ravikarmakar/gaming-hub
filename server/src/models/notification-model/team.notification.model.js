import mongoose from "mongoose";

const teamNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Receiver
    type: {
      type: String,
      enum: ["invite", "join_request", "team_update", "accept", "reject"],
      required: true,
    },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: "Invitation" }, // Kis object se related hai
    status: { type: String, enum: ["unread", "read"], default: "unread" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TeamNotification = mongoose.model(
  "TeamNotification",
  teamNotificationSchema
);
export default TeamNotification;
