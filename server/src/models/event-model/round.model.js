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
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
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

// Auto-generate round name
roundSchema.pre("save", async function (next) {
  if (!this.roundName) {
    const roundCount = await mongoose
      .model("Round")
      .countDocuments({ eventId: this.eventId });
    this.roundName = `Round-${roundCount + 1}`;
    this.roundNumber = roundCount + 1;
  }
  next();
});

const Round = mongoose.model("Round", roundSchema);

export default Round;
