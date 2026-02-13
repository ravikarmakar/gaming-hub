import User from "../user/user.model.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { generateTokens, storeRefreshToken, setCookies } from "../auth/auth.service.js";

/**
 * Escape special regex characters to prevent injection
 * @param {string} str - The string to escape
 * @returns {string} - Escaped string safe for regex
 */
const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @desc    Get all players with filtering, search and pagination
 * @route   GET /api/v1/players
 * @access  Private
 */
export const getPlayers = TryCatchHandler(async (req, res, next) => {
    const {
        username,
        esportsRole,
        isAccountVerified,
        hasTeam,
        hasOrg,
        page = 1,
        limit = 12
    } = req.query;

    // Validate and sanitize pagination parameters
    const validatedPage = Math.max(1, parseInt(page, 10) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 12)); // Max 100 items per page
    const skip = (validatedPage - 1) * validatedLimit;

    // Build query
    const query = {
        _id: { $ne: req.user.userId }, // Exclude self
        isDeleted: false
    };

    if (username) {
        const trimmedUsername = username.trim();
        // Escape regex special characters to prevent injection
        const escapedUsername = escapeRegex(trimmedUsername);

        // Use text search for performance if > 2 chars, else anchored regex
        if (trimmedUsername.length > 2) {
            query.$text = { $search: trimmedUsername };
        } else {
            query.username = { $regex: `^${escapedUsername}`, $options: "i" };
        }
    }

    if (esportsRole) {
        query.esportsRole = esportsRole;
    }

    if (isAccountVerified !== undefined) {
        query.isAccountVerified = isAccountVerified === "true";
    }

    if (req.query.isPlayerVerified !== undefined) {
        query.isPlayerVerified = req.query.isPlayerVerified === "true";
    }

    if (hasTeam !== undefined) {
        if (hasTeam === "true") {
            query.teamId = { $ne: null };
        } else {
            query.teamId = null;
        }
    }

    if (hasOrg !== undefined) {
        if (hasOrg === "true") {
            query.orgId = { $ne: null };
        } else {
            query.orgId = null;
        }
    }

    const [players, totalCount] = await Promise.all([
        User.find(query)
            .select("username avatar esportsRole isAccountVerified teamId createdAt")
            .populate("teamId", "teamName tag imageUrl")
            .sort("-createdAt")
            .skip(skip)
            .limit(validatedLimit)
            .lean(),
        User.countDocuments(query)
    ]);

    const hasMore = skip + players.length < totalCount;

    res.status(200).json({
        success: true,
        players,
        pagination: {
            totalCount,
            currentPage: validatedPage,
            limit: validatedLimit,
            hasMore
        }
    });
});

/**
 * @desc    Get player by ID
 * @route   GET /api/v1/players/:id
 * @access  Private
 */
export const getPlayerById = TryCatchHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new CustomError("Invalid Player ID", 400);
    }

    const player = await User.findOne({ _id: id, isDeleted: false })
        .select("-password -verifyOtp -resetOtp -verifyOtpExpireAt -resetOtpExpireAt")
        .populate("teamId", "teamName tag imageUrl bio")
        .lean();

    if (!player) {
        throw new CustomError("Player not found", 404);
    }

    res.status(200).json({
        success: true,
        player
    });
});
