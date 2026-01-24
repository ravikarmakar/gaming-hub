import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityModel",
    },
    entityModel: {
      type: String,
      required: true,
      enum: ["Team", "Event", "Tournament"],
      default: "Team",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel",
    }, // Invitee (Player or Team)
    receiverModel: {
      type: String,
      required: true,
      enum: ["User", "Team"],
      default: "User",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Invite sender (Owner/Captain/Organizer)
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 200,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Invitation = mongoose.model("Invitation", invitationSchema);

// Compound indexes for performance and data integrity
invitationSchema.index({ receiver: 1, status: 1 }); // Receiver's pending invitations
invitationSchema.index({ entityId: 1, status: 1 }); // Entity's sent invitations
// Unique index to prevent duplicate pending invitations for the same entity/receiver
invitationSchema.index({ receiver: 1, entityId: 1, status: 1 }, {
  unique: true,
  partialFilterExpression: { status: "pending" }
});

export default Invitation;
