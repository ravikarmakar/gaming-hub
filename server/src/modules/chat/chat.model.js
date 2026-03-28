import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        scope: {
            type: String,
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
        senderRole: {
            type: String,
            default: "member",
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
        isEdited: {
            type: Boolean,
            default: false,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Index for fetching message history efficiently across any scope
chatSchema.index({ targetId: 1, scope: 1, createdAt: -1 });

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
