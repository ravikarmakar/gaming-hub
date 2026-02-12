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
  },
  { timestamps: true }
);

// Indexes to prevent duplicate round numbers/names per event (and race conditions during creation)
roundSchema.index({ eventId: 1, roundNumber: 1 }, { unique: true });
roundSchema.index({ eventId: 1, roundName: 1 }, { unique: true });

// Auto-generate round name and number
roundSchema.pre("save", async function (next) {
  // If both are present, we don't need to do anything
  if (this.roundName && this.roundNumber !== undefined) {
    return next();
  }

  // Find the highest round number for this event to determine the next number
  const lastRound = await mongoose
    .model("Round")
    .findOne({ eventId: this.eventId })
    .sort({ roundNumber: -1 })
    .select("roundNumber")
    .lean();

  const nextNumber = lastRound ? lastRound.roundNumber + 1 : 1;

  // Case 1: roundNumber is missing
  if (this.roundNumber === undefined) {
    this.roundNumber = nextNumber;
  }

  // Case 2: roundName is missing
  if (!this.roundName) {
    this.roundName = `Round-${this.roundNumber}`;
  }

  // Case 3: Both were missing (handled by the above two ifs sequentially)

  next();
});

const Round = mongoose.model("Round", roundSchema);

export default Round;
