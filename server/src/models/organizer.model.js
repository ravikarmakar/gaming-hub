import mongoose from "mongoose";

const OrganizerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Jo user organizer hai
    required: true,
  },
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: {
        type: String,
        enum: ["admin", "moderator", "member"],
        default: "member",
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Organizer = mongoose.model("Organizer", OrganizerSchema);

export default Organizer;
