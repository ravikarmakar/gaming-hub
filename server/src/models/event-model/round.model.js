import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    roundName: {
      type: String,
      required: true,
      default: "Round-1",
    },

    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],

    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Round = mongoose.model("Round", roundSchema);

export default Round;
