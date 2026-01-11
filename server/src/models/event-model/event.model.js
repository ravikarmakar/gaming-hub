import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    game: { type: String, required: true },
    startDate: { type: Date, required: true },
    registrationEnds: { type: Date, required: true },
    mode: { type: String, required: true }, // Online / Offline
    slots: { type: Number, required: true }, // Total slots available
    location: { type: String },
    category: { type: String, required: true }, // Solo, Duo, Squad
    prizePool: { type: Number, default: 0 },
    image: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["registration-open", "registration-closed", "live", "completed"],
      default: "registration-open",
    },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  },
  { timestamps: true }
);

// 🔹 Validation: Ensure registration deadline is future-dated
eventSchema.pre("save", function (next) {
  if (this.registrationEnds < Date.now()) {
    return next(new Error("Registration deadline must be in the future."));
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
export default Event;

// TO-DO

//   {
//     attendees: {
//       type: Number,
//       default: 0,
//     },
//     venue: {
//       type: String,
//       required: true,
//     },
//   },
