import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Invitee (Player)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Invite sender (Owner/Captain)
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    // respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Player who accepted/rejected
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    }, // Auto expire in 24h
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Invitation = mongoose.model("Invitation", invitationSchema);

export default Invitation;
