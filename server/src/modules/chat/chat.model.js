import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        senderAvatar: {
            type: String,
            default: "",
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Index for fetching message history efficiently
chatSchema.index({ team: 1, createdAt: -1 });

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
