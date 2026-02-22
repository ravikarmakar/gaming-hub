import User from "../user/user.model.js";
import Team from "../team/team.model.js";
import Organizer from "../organizer/organizer.model.js";
import AuditLog from "./admin.model.js";
import { redis } from "../../shared/config/redis.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * Get platform-wide statistics for the dashboard.
 * Uses Redis for active users to ensure lightning-fast response.
 */
export const getDashboardStats = async () => {
    try {
        // Get data in parallel
        const [totalUsers, totalTeams, totalOrgs, activeUsers] = await Promise.all([
            User.countDocuments({ isDeleted: false }),
            Team.countDocuments({ isDeleted: false }),
            Organizer.countDocuments({ isDeleted: false }),
            redis.get("stats:active_users") || 0
        ]);

        // For Matches, if the model exists, we'd count them here. 
        // Defaulting to 0 for now as we focus on Users/Teams/Orgs.
        const totalMatches = 0;

        return {
            totalUsers,
            totalTeams,
            totalOrgs,
            totalMatches,
            activeUsers: parseInt(activeUsers) || 0
        };
    } catch (error) {
        logger.error("Error in getDashboardStats:", error);
        throw error;
    }
};

/**
 * Universal status updater for Users, Teams, and Organizers.
 * Logs the action for audit accountability.
 */
export const updateEntityStatus = async (adminId, type, id, updates, reqInfo = {}) => {
    let model;
    switch (type) {
        case "User": model = User; break;
        case "Team": model = Team; break;
        case "Organizer": model = Organizer; break;
        default: throw new Error("Invalid entity type");
    }

    const entity = await model.findByIdAndUpdate(id, updates, { new: true });
    if (!entity) throw new Error(`${type} not found`);

    // Invalidate Cache for Users
    if (type === "User") {
        await redis.del(`user_profile:${id}`);
    }

    // Create Audit Log
    try {
        await AuditLog.create({
            adminId,
            action: `TOGGLE_${type.toUpperCase()}_STATUS`,
            targetType: type,
            targetId: id,
            details: updates,
            ipAddress: reqInfo.ip,
            userAgent: reqInfo.userAgent
        });
    } catch (auditError) {
        logger.error(">>> [ADMIN] Audit Log Creation Failed:", auditError);
        // Non-blocking in production, but we want to catch it in tests
        if (process.env.NODE_ENV === "test") throw auditError;
    }

    return entity;
};

/**
 * Fetch recent activity logs for the dashboard.
 */
export const getRecentActivity = async (limit = 20) => {
    return await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("adminId", "username avatar")
        .lean();
};

/**
 * Paginated fetch for management tables with high-performance indexing.
 */
export const getEntities = async (type, page = 1, limit = 10, search = "", filter = "all", currentAdminId = null) => {
    let model;
    let query = { isDeleted: false };

    switch (type) {
        case "User":
            model = User;
            if (currentAdminId) {
                query._id = { $ne: currentAdminId };
            }
            if (filter === "verified") {
                query.isPlayerVerified = true;
                query.isBlocked = false;
            } else if (filter === "banned") {
                query.isBlocked = true;
            }

            if (search && search.trim() !== "") {
                query.$or = [
                    { username: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }
            break;
        case "Team":
            model = Team;
            if (search) query.teamName = { $regex: search, $options: "i" };
            break;
        case "Organizer":
            model = Organizer;
            if (search) query.name = { $regex: search, $options: "i" };
            break;
        default: throw new Error("Invalid entity type");
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        model.countDocuments(query)
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
};

export default {
    getDashboardStats,
    updateEntityStatus,
    getRecentActivity,
    getEntities
};
