import mongoose from "mongoose";

const prizeTierSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
    },
    prize: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    game: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    maxTeams: {
      type: Number,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    prizeTiers: [prizeTierSchema],
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attendees: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["registration-open", "registration-closed", "completed", "live"],
      default: "registration-open",
    },
    registrationEnds: {
      type: Date,
      required: true,
    },
    totalPrizePool: { type: Number, required: true }, // Optional: Prize pool amount
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team", // Reference to the Team model
      },
    ],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (the organizer)
      required: true,
    },
    leaderboard: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Leaderboard", // Reference to Leaderboard
      },
    ],
  },
  { timestamps: true }
);

eventSchema.pre("save", function (next) {
  if (this.registrationEnds < Date.now()) {
    return next(new Error("The registration period has ended."));
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
