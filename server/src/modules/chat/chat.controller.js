import Chat from "./chat.model.js";
import ChatService from "./chat.service.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";

/**
 * Fetch chat message history for any registered scope
 * GET /api/v1/teams/:targetId/chat?scope=team
 * GET /api/v1/organizers/:targetId/chat?scope=organizer
 */
export const getChatHistory = TryCatchHandler(async (req, res, next) => {
    const { targetId } = req.params;
    const { scope = "team", before } = req.query;
    const userId = req.user._id;

    // Sanitize and validate limit (default 50, max 100, min 1)
    const parsedLimit = parseInt(req.query.limit);
    const limit = isNaN(parsedLimit) ? 50 : Math.min(Math.max(1, parsedLimit), 100);

    if (!["team", "organizer", "group"].includes(scope)) {
        return next(new CustomError("Invalid scope parameter", 400));
    }

    // 1. Authorization check
    const hasAccess = await ChatService.checkAccess(scope, userId, targetId);
    if (!hasAccess) {
        return next(new CustomError(`You are not authorized to access this ${scope} chat`, 403));
    }

    // 2. Fetch history via service
    const messages = await ChatService.getHistory(scope, targetId, { 
        limit, 
        before 
    });

    res.status(200).json({
        status: "success",
        data: messages.reverse(),
        hasMore: messages.length === limit
    });
});

/**
 * Update a chat message
 */
export const updateChatMessage = TryCatchHandler(async (req, res, next) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
        return next(new CustomError("Message content is required", 400));
    }

    const message = await Chat.findOne({
        _id: messageId,
        sender: userId,
        isDeleted: false,
    });

    if (!message) {
        return next(new CustomError("Message not found or you are not the sender", 404));
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    if (!message.scope || !message.targetId) {
        return next(new CustomError("Invalid message format: missing room tracking data", 500));
    }

    // Broadcast update via Socket.IO
    const { getIO } = await import("../../shared/config/socket.config.js");
    const io = getIO();
    const room = `chat:${message.scope}:${message.targetId}`;
    io.to(room).emit("chat:update", message);

    res.status(200).json({
        status: "success",
        data: message,
    });
});

/**
 * Delete a chat message (soft delete)
 */
export const deleteChatMessage = TryCatchHandler(async (req, res, next) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Chat.findOne({
        _id: messageId,
        isDeleted: false,
    });

    if (!message) {
        return next(new CustomError("Message not found", 404));
    }

    // Authorization: Sender can delete their own, or someone with elevated role in the scope
    let canDelete = message.sender?.toString() === userId.toString();

    if (!canDelete) {
        const senderRole = await ChatService.getSenderRole(message.scope, userId, message.targetId);
        if (["owner", "manager", "admin"].includes(senderRole)) {
            canDelete = true;
        }
    }

    if (!canDelete) {
        return next(new CustomError("You are not authorized to delete this message", 403));
    }

    message.isDeleted = true;
    await message.save();

    if (!message.scope || !message.targetId) {
        return next(new CustomError("Invalid message format: missing room tracking data", 500));
    }

    // Broadcast delete via Socket.IO
    const { getIO } = await import("../../shared/config/socket.config.js");
    const io = getIO();
    const room = `chat:${message.scope}:${message.targetId}`;
    io.to(room).emit("chat:delete", {
        messageId,
        targetId: message.targetId,
        scope: message.scope
    });

    res.status(200).json({
        status: "success",
        message: "Message deleted successfully",
    });
});
