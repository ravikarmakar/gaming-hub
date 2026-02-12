import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        target: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'targetModel'
        },
        targetModel: {
            type: String,
            required: true,
            enum: ['Team', 'Organizer', 'Event'],
            default: 'Team'
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        message: {
            type: String,
            maxlength: 500,
            default: "",
        },
        handledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        handledAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Prevent multiple pending requests from the same user to the same target
joinRequestSchema.index({ requester: 1, target: 1, status: 1 }, {
    unique: true,
    partialFilterExpression: { status: "pending" }
});

const JoinRequest = mongoose.models.JoinRequest || mongoose.model("JoinRequest", joinRequestSchema);

export default JoinRequest;
