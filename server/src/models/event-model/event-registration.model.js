import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved"],
            default: "approved", // scrims / open event
        },
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        substitutes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

// same team same event me dubara register na ho
eventRegistrationSchema.index(
    { eventId: 1, teamId: 1 },
    { unique: true }
);

export default mongoose.model(
    "EventRegistration",
    eventRegistrationSchema
);
