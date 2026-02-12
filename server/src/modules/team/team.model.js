import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    // Identity
    teamName: {
      type: String,
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
        username: { type: String, required: true }, // Denormalized for scalability
        avatar: { type: String, default: "" }, // Denormalized for scalability
        roleInTeam: {
          type: String,
          enum: [
            "igl",
            "rusher",
            "sniper",
            "support",
            "player",
            "coach",
            "analyst",
            "substitute",
          ],
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
// Text index for optimized search
teamSchema.index({ teamName: "text", tag: "text" });

teamSchema.index({ "stats.winRate": -1 }); // For leaderboards
teamSchema.index({ isVerified: 1, createdAt: -1 }); // Optimized for landing pages
teamSchema.index({ region: 1, isRecruiting: 1, createdAt: -1 }); // Optimized for discovery

// Partial Indexes for uniqueness ensuring name reuse after soft delete
teamSchema.index({ teamName: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
teamSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Auto-generate URL-safe slug from teamName before saving (only on creation)
teamSchema.pre("save", function (next) {
  // Only generate slug for new documents to avoid breaking existing URLs
  if (this.isNew && this.teamName) {
    this.slug = this.teamName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }
  // Calculate win rate
  if (this.stats && this.stats.totalMatches > 0) {
    this.stats.winRate = Math.round((this.stats.wins / this.stats.totalMatches) * 100);
  }
  next();
});

// Calculate winRate on findOneAndUpdate and updateOne operations
teamSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate();

  // Check if stats are being updated
  if (update.$set && (update.$set['stats.wins'] !== undefined || update.$set['stats.totalMatches'] !== undefined) ||
    update.$inc && (update.$inc['stats.wins'] !== undefined || update.$inc['stats.totalMatches'] !== undefined)) {

    // Ensure validators run
    this.setOptions({ runValidators: true });

    // For findOneAndUpdate, we can calculate in post hook if we have the specific document
    // For updateOne, it's harder because we don't get the document back. 
    // Best practice is to rely on application logic or use findOneAndUpdate if result is needed.
    // However, to fix the reported issue "middleware won't work for updateOne", 
    // we can try to fetch the document in the post hook if possible, or just accept that 
    // updateOne strictly updates what's passed.
    // But since winRate is a derived field, we SHOULD update it.

    // We mark this query to trigger post-hook logic
    this._calculateWinRate = true;
  }
  next();
});

// Post middleware to calculate winRate after update
teamSchema.post(['findOneAndUpdate', 'updateOne'], async function (result, next) {
  // 'result' is the document for findOneAndUpdate (if {new: true}) or the operation result for updateOne
  if (this._calculateWinRate) {
    try {
      // If the operation was updateOne, we don't have the doc. We need to find the doc using the query filter.
      // this.getFilter() gives the filter used.
      // But updateOne might update multiple? No, updateOne updates one.

      const filter = this.getFilter();
      const doc = await this.model.findOne(filter); // Fetch the updated document

      if (doc && doc.stats && doc.stats.totalMatches > 0) {
        const newWinRate = Math.round((doc.stats.wins / doc.stats.totalMatches) * 100);
        if (doc.stats.winRate !== newWinRate) {
          doc.stats.winRate = newWinRate;
          await doc.save();
        }
      }
    } catch (err) {
      console.error("Error calculating winRate in post hook:", err);
    }
  }
  next();
});

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;
