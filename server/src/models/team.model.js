import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    slug: { type: String, lowercase: true, trim: true },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        roleInTeam: {
          type: String,
          enum: ["rusher", "sniper", "support", "igl", "player"],
          required: true,
        },
      },
    ],
    playedTournaments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    imageUrl: { type: String, default: null, trim: true },
    bio: { type: String, maxlength: 200, default: "", trim: true },
    isVerified: { type: Boolean, default: false },
    totalWins: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance on queries
teamSchema.index({ slug: 1 });
teamSchema.index({ captain: 1 });
teamSchema.index({ isVerified: 1 });
teamSchema.index({ isDeleted: 1 });

// Auto-generate slug from teamName before saving
teamSchema.pre("save", function (next) {
  if (this.isModified("teamName")) {
    this.slug = this.teamName.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;
