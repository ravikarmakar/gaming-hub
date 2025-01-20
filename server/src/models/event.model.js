import mongoose from "mongoose";

const prizeSchema = new mongoose.Schema({
  total: {
    type: String,
    required: true,
  },
  distribution: [
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
  ],
});

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
    prize: [prizeSchema],
    image: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(v);
        },
        message: "Please enter a valid image URL.",
      },
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
      validate: {
        validator: function (value) {
          return value > Date.now();
        },
        message: "The registration period must be in the future.",
      },
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team", // Reference to the Team model
      },
    ],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer", // Reference to the User model (the organizer)
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
