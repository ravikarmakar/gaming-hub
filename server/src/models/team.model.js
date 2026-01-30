import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    // Identity
    teamName: {
      type: String,
      required: true,
      required: true,
      // unique: true, // Handled by partial index below
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    slug: { type: String, lowercase: true, trim: true }, // Index handled below
    tag: { type: String, maxlength: 5, uppercase: true, trim: true }, // e.g., "SOUL", "TSM"

    // Ownership & Members
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
          enum: ["igl", "rusher", "sniper", "support", "player", "coach", "analyst", "substitute"],
          required: true,
        },
        joinedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
      },
    ],

    // Branding
    imageUrl: { type: String, default: null, trim: true },
    imageFileId: { type: String, default: null, trim: true },
    bannerUrl: { type: String, default: null, trim: true },
    bannerFileId: { type: String, default: null, trim: true },
    bio: { type: String, maxlength: 500, default: "", trim: true },
    socialLinks: {
      twitter: { type: String, default: null },
      discord: { type: String, default: null },
      youtube: { type: String, default: null },
      instagram: { type: String, default: null },
    },

    // Tournament History
    playedTournaments: [
      {
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        placement: { type: Number, default: null }, // 1st, 2nd, etc.
        prizeWon: { type: Number, default: 0 },
        playedAt: { type: Date },
        status: {
          type: String,
          enum: ["upcoming", "ongoing", "completed", "eliminated"],
          default: "upcoming",
        },
      },
    ],

    // Statistics (denormalized for performance)
    stats: {
      totalMatches: { type: Number, default: 0, min: 0 },
      wins: { type: Number, default: 0, min: 0 },
      losses: { type: Number, default: 0, min: 0 },
      draws: { type: Number, default: 0, min: 0 },
      tournamentWins: { type: Number, default: 0, min: 0 },
      totalPrizeWon: { type: Number, default: 0, min: 0 },
      winRate: { type: Number, default: 0, min: 0, max: 100 },
    },

    // Status & Metadata
    isVerified: { type: Boolean, default: false },
    isRecruiting: { type: Boolean, default: false },
    region: {
      type: String,
      enum: ["NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA", "INDIA"],
      default: null,
    },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
teamSchema.index({ captain: 1 });
teamSchema.index({ isVerified: 1 });
teamSchema.index({ isDeleted: 1 });
teamSchema.index({ "teamMembers.user": 1 });
teamSchema.index({ "playedTournaments.event": 1 });
teamSchema.index({ "stats.winRate": -1 }); // For leaderboards
teamSchema.index({ isRecruiting: 1, region: 1 }); // For team discovery
// Partial Indexes for uniqueness ensuring name reuse after soft delete
teamSchema.index({ teamName: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
teamSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Auto-generate slug from teamName before saving
teamSchema.pre("save", function (next) {
  if (this.isModified("teamName")) {
    this.slug = this.teamName.toLowerCase().replace(/\s+/g, "-");
  }
  // Calculate win rate
  if (this.stats && this.stats.totalMatches > 0) {
    this.stats.winRate = Math.round((this.stats.wins / this.stats.totalMatches) * 100);
  }
  next();
});

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;
