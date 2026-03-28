import express from "express";
import { getChatHistory, deleteChatMessage, updateChatMessage } from "./chat.controller.js";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/:targetId/chat", getChatHistory);
router.patch("/:targetId/chat/:messageId", updateChatMessage);
router.delete("/:targetId/chat/:messageId", deleteChatMessage);

export default router;
