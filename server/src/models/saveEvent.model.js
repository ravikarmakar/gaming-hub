import mongoose from "mongoose";

const SaveEventSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  }, // Team playing the tournament

  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  }, // Tournament ID

  dateJoined: {
    type: Date,
    default: Date.now,
  }, // When the team registered

  performance: {
    type: String,
    default: "Pending", // Additional details like performance or result
  },

  status: {
    type: String,
    enum: ["Runing", "Completed", "In Progress"],
    default: "Pending", // Track event registration status
  },

  eventDate: {
    type: Date,
    required: true, // Event date for comparison
  },

  result: {
    type: String,
    enum: ["Winner", "Runner-up", "Participant", "Disqualified"],
    default: "Participant", // Final result of the team in the tournament
  },

  notes: {
    type: String,
    default: "", // Additional notes or comments about the event
  },
});

SaveEventSchema.pre("save", function (next) {
  if (this.eventDate < Date.now()) {
    return next(new Error("Event date cannot be in the past."));
  }
  next();
});

const SaveEvent = mongoose.model("SaveEvent", SaveEventSchema);

export default SaveEvent;
