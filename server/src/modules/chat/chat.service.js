import Chat from "./chat.model.js";
import Team from "../team/team.model.js";
import Organizer from "../organizer/organizer.model.js";
import User from "../user/user.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * ChatService handles business logic for all chat scopes.
 * It uses a registry pattern to allow easy addition of new scopes.
 */
class ChatService {
    constructor() {
        this.scopeHandlers = new Map();
        this.initializeHandlers();
    }

    /**
     * Register a new chat scope with its logic
     */
    registerScopeHandler(scope, handler) {
        this.scopeHandlers.set(scope, handler);
    }

    initializeHandlers() {
        // Team Scope Handler
        this.registerScopeHandler("team", {
            checkAccess: async (userId, targetId) => {
                const isMember = await Team.exists({
                    _id: targetId,
                    $or: [{ captain: userId }, { "teamMembers.user": userId }],
                    isDeleted: false,
                });
                return !!isMember;
            },
            getSenderRole: async (userId, targetId) => {
                const team = await Team.findById(targetId).select("captain teamMembers").lean();
                if (!team) return "member";

                if (team.captain?.toString() === userId.toString()) return "owner";

                const member = team.teamMembers?.find(m => m.user?.toString() === userId.toString());
                return member?.roleInTeam === "manager" ? "manager" : "member";
            }
        });

        // Organizer Scope Handler
        this.registerScopeHandler("organizer", {
            checkAccess: async (userId, targetId) => {
                const organizer = await Organizer.findOne({ _id: targetId, isDeleted: false }).lean();
                if (!organizer) return false;

                const isOwner = organizer.ownerId?.toString() === userId.toString();
                const isStaff = await User.exists({ _id: userId, orgId: targetId });
                return isOwner || isStaff;
            },
            getSenderRole: async (userId, targetId) => {
                const organizer = await Organizer.findById(targetId).select("ownerId").lean();
                if (!organizer) return "staff";

                if (organizer.ownerId?.toString() === userId.toString()) return "owner";
                return "staff";
            }
        });
    }

    /**
     * Global access check
     */
    async checkAccess(scope, userId, targetId) {
        const handler = this.scopeHandlers.get(scope);
        if (!handler) throw new CustomError(`Unsupported chat scope: ${scope}`, 400);
        return await handler.checkAccess(userId, targetId);
    }

    /**
     * Get sender role for a specific scope
     */
    async getSenderRole(scope, userId, targetId) {
        const handler = this.scopeHandlers.get(scope);
        if (!handler) return "member";
        return await handler.getSenderRole(userId, targetId);
    }

    /**
     * Fetch chat history
     */
    async getHistory(scope, targetId, limit = 50) {
        return await Chat.find({ targetId, scope, isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    /**
     * Create a new message
     */
    async createMessage({ scope, targetId, senderId, senderName, senderAvatar, content }) {
        if (!content || typeof content !== "string" || content.trim().length === 0) {
            throw new CustomError("Message content is required", 400);
        }

        const senderRole = await this.getSenderRole(scope, senderId, targetId);

        return await Chat.create({
            scope,
            targetId,
            sender: senderId,
            senderName,
            senderAvatar,
            senderRole,
            content: content.trim().substring(0, 1000)
        });
    }
}

export default new ChatService();
