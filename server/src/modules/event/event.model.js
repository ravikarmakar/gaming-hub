import mongoose from "mongoose";

export const registrationStatusEnum = [
  "registration-open",
  "registration-closed",
  "live",
];

export const eventProgressEnum = [
  "pending",
  "ongoing",
  "completed",
];

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

    // Registration tracking (For UI)
    registrationStatus: {
      type: String,
      enum: registrationStatusEnum,
      default: "registration-open",
      index: true,
    },

    // Tournament progress tracking 
    eventProgress: {
      type: String,
      enum: eventProgressEnum,
      default: "pending",
      index: true,
    },

    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    description: { type: String, default: "" },
    prizePool: { type: Number, default: 0 },
    image: { type: String, default: "" },
    imageFileId: { type: String, default: null, trim: true },
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

// Indexes for performance and scalability
eventSchema.index({ orgId: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ game: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ startDate: 1 });

export default mongoose.model("Event", eventSchema);
