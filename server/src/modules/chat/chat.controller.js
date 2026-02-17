import Chat from "./chat.model.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import Team from "../team/team.model.js";

/**
 * Fetch chat message history for a team
 * GET /api/v1/teams/:teamId/chat
 */
export const getTeamChatHistory = TryCatchHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user._id;

    // 1. Verify user is a member of the team
    const isMember = await Team.exists({
        _id: teamId,
        "teamMembers.user": userId,
        isDeleted: false,
    });

    if (!isMember) {
        return next(new CustomError("You are not a member of this team", 403));
    }

    // 2. Fetch last 50 messages
    const messages = await Chat.find({
        team: teamId,
        isDeleted: false,
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    // Return in chronological order
    res.status(200).json({
        status: "success",
        data: messages.reverse(),
    });
});

/**
 * Update a chat message
 * PATCH /api/v1/teams/:teamId/chat/:messageId
 */
export const updateChatMessage = TryCatchHandler(async (req, res, next) => {
    const { teamId, messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // 1. Verify user is a member of the team
    const isMember = await Team.exists({
        _id: teamId,
        "teamMembers.user": userId,
        isDeleted: false,
    });

    if (!isMember) {
        return next(new CustomError("You are not a member of this team", 403));
    }

    if (!content || content.trim().length === 0) {
        return next(new CustomError("Message content is required", 400));
    }

    if (content.length > 1000) {
        return next(new CustomError("Message content too long (max 1000 characters)", 400));
    }

    const message = await Chat.findOne({
        _id: messageId,
        team: teamId,
        sender: userId,
        isDeleted: false,
    });

    if (!message) {
        return next(new CustomError("Message not found or you are not the sender", 404));
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    // Broadcast update via Socket.IO
    const { getIO } = await import("../../shared/config/socket.config.js");
    const io = getIO();
    io.to(`team:${teamId}`).emit("chat:update", message);

    res.status(200).json({
        status: "success",
        data: message,
    });
});

/**
 * Delete a chat message (soft delete)
 * DELETE /api/v1/teams/:teamId/chat/:messageId
 */
export const deleteChatMessage = TryCatchHandler(async (req, res, next) => {
    const { teamId, messageId } = req.params;
    const userId = req.user._id;

    const message = await Chat.findOne({
        _id: messageId,
        team: teamId,
        isDeleted: false,
    });

    if (!message) {
        return next(new CustomError("Message not found", 404));
    }

    // Authorization: Sender can delete their own, Owner/Manager can delete any
    let canDelete = message.sender && message.sender.toString() === userId.toString();

    if (!canDelete) {
        const team = await Team.findById(teamId).select("captain teamMembers").lean();
        if (team) {
            const isOwner = team.captain && team.captain.toString() === userId.toString();
            const member = team.teamMembers?.find(m => m.user && m.user.toString() === userId.toString());
            const isManager = member && member.roleInTeam === "manager";

            if (isOwner || isManager) {
                canDelete = true;
            }
        }
    }

    if (!canDelete) {
        return next(new CustomError("You are not authorized to delete this message", 403));
    }

    message.isDeleted = true;
    await message.save();

    // Broadcast delete via Socket.IO
    const { getIO } = await import("../../shared/config/socket.config.js");
    const io = getIO();
    io.to(`team:${teamId}`).emit("chat:delete", { messageId, teamId });

    res.status(200).json({
        status: "success",
        message: "Message deleted successfully",
    });
});
