import ChatService from "./chat.service.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { getIO } from "../../shared/config/socket.config.js";

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

  if (!["team", "organizer", "group", "user"].includes(scope)) {
    return next(new CustomError("Invalid scope parameter", 400));
  }

  // 1. Authorization check
  const hasAccess = await ChatService.checkAccess(scope, userId, targetId);
  if (!hasAccess) {
    return next(new CustomError(`You are not authorized to access this ${scope} chat`, 403));
  }

  // 2. Fetch history via service
  const result = await ChatService.getHistory(scope, targetId, {
    limit,
    before,
    userId
  });

  res.status(200).json({
    status: "success",
    data: result.messages,
    hasMore: result.hasMore
  });
});

/**
 * Update a chat message
 */
export const updateChatMessage = TryCatchHandler(async (req, res, next) => {
  const { messageId, targetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return next(new CustomError("Message content is required", 400));
  }

  const message = await ChatService.updateMessage(messageId, userId, content.trim(), targetId);

  // Broadcast update via Socket.IO
  const io = getIO();
  let room;
  if (message.scope === "user") {
    const ids = [message.sender.toString(), message.targetId.toString()].sort();
    room = `chat:user:${ids[0]}--${ids[1]}`;
  } else {
    room = `chat:${message.scope}:${message.targetId}`;
  }
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
  const { messageId, targetId } = req.params;
  const userId = req.user._id;

  const message = await ChatService.deleteMessage(messageId, userId, targetId);

  // Broadcast delete via Socket.IO
  const io = getIO();
  let room;
  if (message.scope === "user") {
    const ids = [message.sender.toString(), message.targetId.toString()].sort();
    room = `chat:user:${ids[0]}--${ids[1]}`;
  } else {
    room = `chat:${message.scope}:${message.targetId}`;
  }
  io.to(room).emit("chat:delete", {
    messageId,
    targetId: message.targetId,
    senderId: message.sender,
    scope: message.scope
  });

  res.status(200).json({
    status: "success",
    data: message,
  });
});
