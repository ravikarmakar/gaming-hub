import mongoose from "mongoose";
import { logger } from "../../shared/utils/logger.js";

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
            "manager",
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
    const baseSlug = this.teamName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Add random suffix to minimize collision probability on similar names
    // e.g. "team-alpha" -> "team-alpha-x7z2"
    this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }
  // Calculate win rate
  if (this.stats) {
    if (this.stats.totalMatches > 0) {
      this.stats.winRate = Math.round((this.stats.wins / this.stats.totalMatches) * 100);
    } else {
      this.stats.winRate = 0;
    }
  }
  next();
});

// Calculate winRate on findOneAndUpdate and updateOne operations
teamSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate();

  // Check if stats are being updated
  // FIX: Properly wrap conditions with parentheses to enforce precedence
  // We check if either set.stats or inc.stats is present
  const hasSetStats = update.$set && (update.$set['stats.wins'] !== undefined || update.$set['stats.totalMatches'] !== undefined);
  const hasIncStats = update.$inc && (update.$inc['stats.wins'] !== undefined || update.$inc['stats.totalMatches'] !== undefined);

  if (hasSetStats || hasIncStats) {

    // Ensure validators run
    this.setOptions({ runValidators: true });

    // We mark this query to trigger post-hook logic
    this._calculateWinRate = true;
  }
  next();
});

// Post middleware to calculate winRate after update
teamSchema.post(['findOneAndUpdate', 'updateOne'], async function (result, next) {
  if (this._calculateWinRate) {
    try {
      let docId;

      // Determine document ID
      if (result && result._id) {
        docId = result._id;
      } else {
        // Fallback for updateOne where result is not the doc
        const filter = this.getFilter();
        // This might not precise if filter is broad, but for ID-based updates it works
        const found = await this.model.findOne(filter).select('_id');
        if (found) docId = found._id;
      }

      if (docId) {
        // Fetch the LATEST document to ensure we have updated stats
        const doc = await this.model.findById(docId);

        if (doc && doc.stats) {
          let newWinRate = 0;
          if (doc.stats.totalMatches > 0) {
            newWinRate = Math.round((doc.stats.wins / doc.stats.totalMatches) * 100);
          }

          // Only update if changed prevents infinite loops if we are careful
          if (doc.stats.winRate !== newWinRate) {
            // Use updateOne to avoid triggering pre-save hooks if any, 
            // BUT we are in post-hook of updateOne.
            // We must ensure we don't trigger THIS hook again.
            // We are updating 'stats.winRate', which is NOT in our check above (wins/totalMatches).
            // So it won't trigger the recalculation loop. Safe.
            await this.model.updateOne(
              { _id: doc._id },
              { $set: { 'stats.winRate': newWinRate } }
            );
          }
        }
      }
      next();
    } catch (err) {
      if (logger) {
        logger.error("Error calculating winRate in post hook:", err);
      } else {
        console.error("Error calculating winRate in post hook:", err);
      }
      next(err);
    }
  } else {
    next();
  }
});

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;
