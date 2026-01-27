import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    game: { type: String, required: true },

    eventType: {
      type: String,
      enum: ["scrims", "tournament"],
      required: true,
    },

    category: {
      type: String,
      enum: ["solo", "duo", "squad"],
      required: true,
    },

    startDate: { type: Date, required: true },
    registrationEndsAt: { type: Date, required: true },

    maxSlots: { type: Number, required: true },
    joinedSlots: { type: Number, default: 0 },

    registrationMode: {
      type: String,
      enum: ["open", "invite-only"],
      default: "open",
    },

    status: {
      type: String,
      enum: [
        "registration-open",
        "registration-closed",
        "live",
        "completed",
      ],
      default: "registration-open",
    },

    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    description: { type: String, default: "" },
    prizePool: { type: Number, default: 0 },
    image: { type: String, default: "" },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    trending: { type: Boolean, default: false },
    eventEndAt: { type: Date },
    prizeDistribution: [
      {
        rank: { type: Number, required: true },
        amount: { type: Number, required: true },
        label: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
