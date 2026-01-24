import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
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

// Prevent multiple pending requests from the same user to the same team
joinRequestSchema.index({ requester: 1, team: 1, status: 1 }, {
    unique: true,
    partialFilterExpression: { status: "pending" }
});

const JoinRequest = mongoose.models.JoinRequest || mongoose.model("JoinRequest", joinRequestSchema);

export default JoinRequest;
