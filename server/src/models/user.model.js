import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    termsAccepted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["admin", "max admin", "user", "staff", "moderator"],
      default: "user",
    },
    esportsRole: { type: String, default: "player" },
    isOrganizer: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    globalRank: { type: Number, default: 0 },
    country: { type: String, default: null },
    device: { type: String, default: null },
    playstyle: { type: String, default: null },

    // Team Management
    activeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    isCaptain: { type: Boolean, default: false },
    createdTeamCount: { type: Number, default: 0 },
    maxTeamCreationLimit: { type: Number, default: 3 },

    joinedTeamsHistory: [
      {
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        role: { type: String, enum: ["player", "captain", "substitute"] },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date, default: null },
      },
    ],
    maxTeamJoinLimit: { type: Number, default: 5 },

    // Notification System
    notifications: [
      {
        type: {
          type: String,
          enum: ["invite", "request", "match", "announcement"],
        },
        message: { type: String },
        relatedId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "notifications.type",
        },
        status: { type: String, enum: ["unread", "read"], default: "unread" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Invite System
    sentInvites: [
      {
        inviteId: { type: mongoose.Schema.Types.ObjectId, auto: true },
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        sentTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        sentAt: { type: Date, default: Date.now },
      },
    ],

    // Invites & Requests
    invitesReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invite" }],
    joinRequestsSent: [
      { type: mongoose.Schema.Types.ObjectId, ref: "JoinRequest" },
    ],

    game: { type: String },
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    achievements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
    ],
    eventHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    badges: [
      {
        badgeName: { type: String },
        criteria: { type: String },
        awarded: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware to hash passwords before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error("Password is not set for this user.");
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
