import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    roundName: {
      type: String,
      required: false, // Auto-generated if not provided
    },
    roundNumber: {
      type: Number,
      required: false, // Auto-generated if not provided
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["tournament", "invited-tournament", "t1-special"],
      default: "tournament",
    },
    // Configuration for Groups
    startTime: {
      type: Date, // When the first match starts
    },
    dailyStartTime: {
      type: String, // e.g., "13:00"
    },
    dailyEndTime: {
      type: String, // e.g., "21:00"
    },
    gapMinutes: {
      type: Number, // Gap between groups
      default: 0,
    },
    matchesPerGroup: {
      type: Number,
      default: 1,
    },
    qualifyingTeams: {
      type: Number,
      default: 1,
    },
    groupSize: {
      type: Number,
      default: 12,
    },
    isLeague: {
      type: Boolean,
      default: false,
    },
    leaguePairingType: {
      type: String,
      enum: ["standard", "axb-bxc-axc"],
      default: "standard",
    },
    eligibleTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
  },
  { timestamps: true }
);

// Indexes to prevent duplicate round numbers/names per event (and race conditions during creation)
// Indexes to prevent duplicate round numbers/names per event
// Use partialFilterExpression to allow multiple documents to have these fields missing
roundSchema.index({ eventId: 1, roundNumber: 1 }, {
  unique: true,
  partialFilterExpression: { roundNumber: { $exists: true } }
});
roundSchema.index({ eventId: 1, roundName: 1 }, {
  unique: true,
  partialFilterExpression: { roundName: { $exists: true } }
});

// Auto-generate round name if not provided
roundSchema.pre("save", async function (next) {
  if (!this.roundName && this.roundNumber !== undefined) {
    this.roundName = `Round-${this.roundNumber}`;
  }
  next();
});

const Round = mongoose.model("Round", roundSchema);

export default Round;
