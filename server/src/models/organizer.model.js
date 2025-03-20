import mongoose from "mongoose";
import { rolesPermissions } from "./user.model.js";

const OrganizerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isVerified: { type: Boolean, default: false },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: Object.keys(rolesPermissions),
          default: "staff",
        },
      },
    ],
    events: [
      {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        name: String,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

const Organizer = mongoose.model("Organizer", OrganizerSchema);

export default Organizer;
