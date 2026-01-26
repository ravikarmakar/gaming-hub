// import mongoose from "mongoose";

// const invitationSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: [
//       "TEAM_JOIN",
//       "ORG_JOIN",
//       "TOURNAMENT_REGISTER",
//       "TEAM_CHALLENGE",
//       "SCRIM_INVITE"
//     ],
//     required: true,
//   },

//   action: {
//     type: String,
//     enum: ["ADD_TEAM_MEMBER", "ADD_ORG_MEMBER", "REGISTER", "CHALLENGE", "ASSIGN_ROLE"],
//     required: true,
//   },

//   entityId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: "entityModel",
//   },
//   entityModel: {
//     type: String,
//     enum: ["Team", "Event", "Tournament", "Organizer"],
//     required: true,
//   },

//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: "receiverModel",
//   },
//   receiverModel: {
//     type: String,
//     enum: ["User", "Team"],
//     required: true,
//   },

//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },

//   role: {
//     type: String,
//     default: null, // team:player, org:staff, etc
//   },

//   status: {
//     type: String,
//     enum: ["pending", "accepted", "rejected", "expired"],
//     default: "pending",
//   },

//   message: {
//     type: String,
//     maxlength: 200,
//   },

//   expiresAt: {
//     type: Date,
//     index: { expireAfterSeconds: 0 },
//   },

//   sentAt: { type: Date, default: Date.now },
// }, { timestamps: true });

// const Invitation = mongoose.model("Invitation", invitationSchema);

// export default Invitation;


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
      enum: ["Team", "Event", "Tournament", "Organizer"],
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
    role: {
      type: String,
      default: "member", // or use specific roles like 'org:staff', 'team:player'
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
