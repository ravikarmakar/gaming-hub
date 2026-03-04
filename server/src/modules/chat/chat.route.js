import express from "express";
import { getChatHistory, deleteChatMessage, updateChatMessage } from "./chat.controller.js";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/:targetId/chat", getChatHistory);
router.patch("/chat/:messageId", updateChatMessage);
router.delete("/chat/:messageId", deleteChatMessage);

export default router;
