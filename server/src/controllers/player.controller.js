import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";

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

    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query = {
        _id: { $ne: req.user.userId }, // Exclude self
        isDeleted: false
    };

    if (username) {
        query.username = { $regex: username, $options: "i" };
    }

    if (esportsRole) {
        query.esportsRole = esportsRole;
    }

    if (isAccountVerified !== undefined) {
        query.isAccountVerified = isAccountVerified === "true";
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
            .limit(Number(limit))
            .lean(),
        User.countDocuments(query)
    ]);

    const hasMore = skip + players.length < totalCount;

    res.status(200).json({
        success: true,
        players,
        pagination: {
            totalCount,
            currentPage: Number(page),
            limit: Number(limit),
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
        .select("-password -verifyOtp -resetOtp")
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
