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
    enum: ["Ongoing", "Completed"],
    default: "Ongoing", // Track event registration status
  },

  eventDate: {
    type: Date,
    required: true, // Event date for comparison
    validate: {
      validator: function (v) {
        // Only validate for new documents
        if (!this.isNew) return true;
        return v >= Date.now();
      },
      message: "Event date cannot be in the past."
    }
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

// Unique index to prevent duplicate team registrations for the same event
SaveEventSchema.index({ team: 1, event: 1 }, { unique: true });

const SaveEvent = mongoose.model("SaveEvent", SaveEventSchema);

export default SaveEvent;
