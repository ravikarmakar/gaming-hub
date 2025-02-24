import mongoose from "mongoose";

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
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    attendees: {
      type: Number,
      default: 0,
    },
    mode: {
      type: String,
      required: true,
    },
    slots: {
      type: String,
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
    venue: {
      type: String,
      required: true,
    },
    prize: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prize",
    },

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
      ref: "Organizer",
    },
    rounds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Round" }],
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
