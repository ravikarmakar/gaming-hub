import mongoose from "mongoose";
import {
  eventTypeEnum,
  eventCategoryEnum,
  registrationModeEnum,
  registrationStatusEnum,
  eventProgressEnum,
  eventRoadmapTypeEnum
} from "./event.constants.js";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    game: { type: String, required: true },

    eventType: {
      type: String,
      enum: eventTypeEnum,
      required: true,
    },
    isPaid: { type: Boolean, default: false },
    entryFee: { type: Number, default: 0, min: [0, "Entry fee cannot be negative"] },
    matchCount: { type: Number, default: 1, min: [1, "Match count must be at least 1"] },
    map: { type: [String], default: [] },

    category: {
      type: String,
      enum: eventCategoryEnum,
      required: true,
    },

    startDate: { type: Date, required: true },
    registrationEndsAt: { type: Date, required: true },

    maxSlots: { type: Number, required: true, min: [1, "Max slots must be at least 1"] },
    joinedSlots: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          // 'this' refers to the document being validated
          if (this.maxSlots !== undefined) {
            return v <= this.maxSlots;
          }
          return true;
        },
        message: "Joined slots cannot exceed max slots"
      }
    },

    registrationMode: {
      type: String,
      enum: registrationModeEnum,
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
    roundCount: { type: Number, default: 0 },
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
    hasRoadmap: { type: Boolean, default: false },
    hasInvitedTeams: { type: Boolean, default: false },
    roadmaps: [
      {
        type: { type: String, enum: eventRoadmapTypeEnum, required: true },
        data: { type: mongoose.Schema.Types.Mixed, default: [] }
      }
    ],
    invitedTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      }
    ],
    registeredTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      }
    ],
  },
  { timestamps: true }
);

// Indexes for performance and scalability
eventSchema.index({ orgId: 1 });
// Note: 'status' field is deprecated. Use 'registrationStatus' and 'eventProgress' instead.
// Indexes for these fields are defined inline in the schema.
eventSchema.index({ game: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ startDate: 1 });

export {
  eventTypeEnum,
  eventCategoryEnum,
  registrationModeEnum,
  registrationStatusEnum,
  eventProgressEnum,
  eventRoadmapTypeEnum
} from "./event.constants.js";

export default mongoose.model("Event", eventSchema);
