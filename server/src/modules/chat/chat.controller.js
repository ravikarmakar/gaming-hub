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
 * Delete a chat message (soft delete)
 * DELETE /api/v1/teams/:teamId/chat/:messageId
 */
export const deleteChatMessage = TryCatchHandler(async (req, res, next) => {
    const { teamId, messageId } = req.params;
    const userId = req.user._id;

    const message = await Chat.findOne({
        _id: messageId,
        team: teamId,
        sender: userId,
    });

    if (!message) {
        return next(new CustomError("Message not found or you are not the sender", 404));
    }

    message.isDeleted = true;
    await message.save();

    res.status(200).json({
        status: "success",
        message: "Message deleted successfully",
    });
});
