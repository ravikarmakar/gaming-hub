import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, trim: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (team captain)
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model (team members)
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "captain", "player", "substitute"],
          default: "player",
        },
      },
    ],
    isVerified: { type: Boolean, default: false }, // Future verification system
    maxMembers: { type: Number, default: 6 },
    // pendingRequests: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "JoinRequest" },
    // ],
    playedTournaments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament", // Reference to tournaments the team is registered in
      },
    ],
  },
  { timestamps: true }
);

// Add index for captain
teamSchema.index({ captain: 1 });

teamSchema.pre("save", function (next) {
  // Check if there are duplicate members
  const memberIds = this.members.map((member) => member.userId.toString());
  const uniqueMemberIds = new Set(memberIds);
  if (memberIds.length !== uniqueMemberIds.size) {
    return next(new Error("Duplicate members are not allowed in the team."));
  }

  // Ensure maxPlayers limit is respected
  if (this.members.length > this.maxPlayers) {
    return next(new Error("Too many members in the team."));
  }

  next();
});

const Team = mongoose.model("Team", teamSchema);

export default Team;
