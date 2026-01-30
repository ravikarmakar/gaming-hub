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
    // groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed"],
      default: "pending",
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
