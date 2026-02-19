import express from "express";
import { getTeamChatHistory, deleteChatMessage, updateChatMessage } from "./chat.controller.js";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/:teamId/chat", getTeamChatHistory);
router.patch("/:teamId/chat/:messageId", updateChatMessage);
router.delete("/:teamId/chat/:messageId", deleteChatMessage);

export default router;
