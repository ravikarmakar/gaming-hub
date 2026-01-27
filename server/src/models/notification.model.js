import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // null for system notifications
        },
        type: {
            type: String,
            required: true,
            index: true,
        },
        content: {
            title: { type: String, required: true },
            message: { type: String, required: true },
        },
        status: {
            type: String,
            enum: ["unread", "read", "archived"],
            default: "unread",
            index: true,
        },
        relatedData: {
            teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
            eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
            orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
            inviteId: { type: mongoose.Schema.Types.ObjectId }, // Generic ID for action-based notifications
        },
        actions: [
            {
                label: { type: String, required: true },
                actionType: { type: String, enum: ["ACCEPT", "REJECT", "VIEW"], required: true },
                payload: { type: mongoose.Schema.Types.Mixed },
            },
        ],
        expiresAt: {
            type: Date,
            default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // Expire after 30 days
            index: { expires: 0 },
        },
    },
    {
        timestamps: true,
    }
);

// Index for fetching latest notifications first
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
