import Chat from "./chat.model.js";
import Team from "../team/team.model.js";
import Organizer from "../organizer/organizer.model.js";
import User from "../user/user.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { logger } from "../../shared/utils/logger.js";
import { redis } from "../../shared/config/redis.js";

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

        // Group Scope Handler
        this.registerScopeHandler("group", {
            checkAccess: async (userId, targetId) => {
                const Group = (await import("../event/models/group.model.js")).default;
                const Team = (await import("../team/team.model.js")).default;

                // ⚡ Optimization: Single query with deep population to fetch all needed context
                const group = await Group.findById(targetId)
                    .populate({
                        path: "roundId",
                        select: "eventId",
                        populate: {
                            path: "eventId",
                            select: "orgId"
                        }
                    })
                    .lean();

                if (!group) return false;

                // 1. Check if user is in one of the teams
                const isTeamMember = await Team.exists({
                    _id: { $in: group.teams },
                    $or: [{ captain: userId }, { "teamMembers.user": userId }],
                    isDeleted: false
                });
                if (isTeamMember) return true;

                // 2. Check if user is a high official of the organizer
                // Context is already loaded via populate
                const orgId = group.roundId?.eventId?.orgId;
                if (!orgId) return false;

                const user = await User.findById(userId).select("roles").lean();
                if (!user) return false;

                // ⚡ FIX: Role names must match Roles.ORG constants (underscore, org: prefix)
                return user?.roles?.some(r =>
                    r.scope === "org" &&
                    r.scopeId?.toString() === orgId.toString() &&
                    ["org:owner", "org:co_owner", "org:manager"].includes(r.role)
                ) || false;
            },
            getSenderRole: async (userId, targetId) => {
                const Group = (await import("../event/models/group.model.js")).default;
                const Team = (await import("../team/team.model.js")).default;

                const group = await Group.findById(targetId)
                    .select("teams roundId")
                    .populate({
                        path: "roundId",
                        select: "eventId",
                        populate: {
                            path: "eventId",
                            select: "orgId"
                        }
                    })
                    .lean();

                if (!group) return "member";

                const isTeamMember = await Team.exists({
                    _id: { $in: group.teams },
                    $or: [{ captain: userId }, { "teamMembers.user": userId }],
                    isDeleted: false
                });

                if (isTeamMember) return "member";

                const orgId = group.roundId?.eventId?.orgId;
                if (!orgId) return "member";

                const user = await User.findById(userId).select("roles").lean();

                // ⚡ FIX: Role names must match Roles.ORG constants
                const isOfficial = user?.roles?.some(r =>
                    r.scope === "org" &&
                    r.scopeId?.toString() === orgId.toString() &&
                    ["org:owner", "org:co_owner", "org:manager"].includes(r.role)
                );

                return isOfficial ? "official" : "member";
            }
        });
    }

    /**
     * Global access check
     */
    async checkAccess(scope, userId, targetId) {
        const handler = this.scopeHandlers.get(scope);
        if (!handler) throw new CustomError(`Unsupported chat scope: ${scope}`, 400);

        const cacheKey = `chat_access:${scope}:${userId}:${targetId}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached !== null) {
                return cached === "1";
            }
        } catch (err) {
            logger.error(`Redis error in chat checkAccess: ${err.message}`);
        }

        const hasAccess = await handler.checkAccess(userId, targetId);

        try {
            if (hasAccess) {
                await redis.set(cacheKey, "1", { ex: 300 }); // Cache for 5 mins
            } else {
                await redis.set(cacheKey, "0", { ex: 60 }); // Cache denial for 1 min
            }
        } catch (err) {
            logger.error(`Redis error setting checkAccess cache: ${err.message}`);
        }

        return hasAccess;
    }

    /**
     * Get sender role for a specific scope
     */
    async getSenderRole(scope, userId, targetId) {
        const handler = this.scopeHandlers.get(scope);
        if (!handler) return "member";

        const cacheKey = `chat_role:${scope}:${userId}:${targetId}`;
        try {
            const cachedRole = await redis.get(cacheKey);
            if (cachedRole) return cachedRole;
        } catch (err) {
            logger.error(`Redis error in chat getSenderRole: ${err.message}`);
        }

        const role = await handler.getSenderRole(userId, targetId);

        try {
            await redis.set(cacheKey, role, { ex: 300 }); // Cache for 5 mins
        } catch (err) {
            logger.error(`Redis error setting getSenderRole cache: ${err.message}`);
        }

        return role;
    }

    /**
     * Fetch chat history with cursor-based pagination
     */
    async getHistory(scope, targetId, { limit = 50, before = null } = {}) {
        // Upper bound validation to prevent resource exhaustion
        const finalLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
        const query = { targetId, scope, isDeleted: false };
        if (before) {
            const date = new Date(before);
            if (!isNaN(date.getTime())) {
                query.createdAt = { $lt: date };
            }
        }

        return await Chat.find(query)
            .sort({ createdAt: -1 })
            .limit(finalLimit)
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
