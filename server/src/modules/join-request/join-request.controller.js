import JoinRequest from "../join-request/join-request.model.js";
import User from "../user/user.model.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { emitMemberJoined, emitJoinRequestCreated } from "../team/team.socket.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { invalidateCacheWithRetry } from "../../shared/utils/cache.js";
import { logger } from "../../shared/utils/logger.js";
import { getStrategy } from "./target.strategy.js";
import { handleJoinRequestService } from "./join-request.service.js";

// @desc    Send a request to join a Team, Organization, or Event
// @route   POST /api/v1/teams/:teamId/join-request
// @route   POST /api/v1/organizers/:orgId/join
export const sendJoinRequest = TryCatchHandler(async (req, res, next) => {
    const { teamId, orgId, eventId } = req.params;
    const { userId } = req.user;
    const { message } = req.body;

    const targetId = teamId || orgId || eventId;
    const targetModel = teamId ? "Team" : (orgId ? "Organizer" : "Event");

    if (!targetId) {
        throw new CustomError("Target ID is required", 400);
    }

    const strategy = getStrategy(targetModel);

    const { joinRequest, user } = await withOptionalTransaction(async (session) => {
        // 1. Delegate Logic to Strategy
        const { resource, recipientId } = await strategy.validateJoinRequest(userId, targetId, session);

        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new CustomError("User not found", 404);
        }

        // 2. Create Request (unique index prevents duplicates)
        let joinRequest;
        try {
            const [createdRequest] = await JoinRequest.create([{
                requester: userId,
                target: targetId,
                targetModel: targetModel,
                message: message || `${targetModel} join request from ${user.username}`,
            }], { session });
            joinRequest = createdRequest;
        } catch (error) {
            if (error.code === 11000) {
                throw new CustomError(`You already have a pending request for this ${targetModel.toLowerCase()}`, 400);
            }
            throw error;
        }

        // 3. Notify Responsible Party
        if (recipientId) {
            await createNotification({
                recipient: recipientId,
                sender: userId,
                type: `${targetModel.toUpperCase()}_JOIN_REQUEST`,
                content: {
                    title: "New Join Request",
                    message: `${user.username} has requested to join your ${targetModel.toLowerCase()}.`,
                },
                relatedData: {
                    targetId: resource._id,
                    requestId: joinRequest._id,
                },
            }, { session });
        }

        return { joinRequest, user };
    });

    // 4. Real-time updates via Socket.io
    if (targetModel === "Team") {
        // We need the populated requester for the UI to display it immediately
        const populatedRequest = await JoinRequest.findById(joinRequest._id)
            .populate("requester", "username avatar _id");

        if (populatedRequest) {
            emitJoinRequestCreated(targetId, populatedRequest);
        }
    }

    res.status(201).json({
        success: true,
        message: "Join request sent successfully",
        joinRequest,
    });
});

// @desc    Get all pending join requests for a resource (Team or Org)
// @route   GET /api/v1/teams/join-requests/all
// @route   GET /api/v1/:orgId/join-requests
export const getJoinRequests = TryCatchHandler(async (req, res, next) => {
    // rbacContext is attached by authorize middleware
    const { scopeId, scope } = req.rbacContext;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
        JoinRequest.find({
            target: scopeId,
            status: "pending",
        })
            .populate("requester", "username avatar _id")
            .sort("-createdAt")
            .skip(skip)
            .limit(limitNum),
        JoinRequest.countDocuments({
            target: scopeId,
            status: "pending",
        })
    ]);

    res.status(200).json({
        success: true,
        message: "Join requests fetched successfully",
        data: requests,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});

// @desc    Handle (Accept/Reject) a join request
// @route   PUT /api/v1/teams/join-requests/:requestId
export const handleJoinRequest = TryCatchHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const { action } = req.body; // 'accepted' or 'rejected'
    const { userId } = req.user;

    if (!["accepted", "rejected"].includes(action)) {
        throw new CustomError("Invalid action. Use 'accepted' or 'rejected'", 400);
    }

    const { strategyResult } = await handleJoinRequestService(requestId, action, userId);

    res.status(200).json({
        success: true,
        message: `Request ${action} successfully`,
        data: strategyResult?.responseData || null
    });
});

// @desc    Bulk reject all pending join requests for a resource
// @route   DELETE /api/v1/teams/:teamId/join-requests/clear-all
export const bulkRejectJoinRequests = TryCatchHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const { userId } = req.user;

    const pendingCount = await withOptionalTransaction(async (session) => {
        const pendingQuery = JoinRequest.find({
            target: teamId,
            status: "pending",
        });
        if (session) pendingQuery.session(session);
        const pendingRequests = await pendingQuery;

        if (pendingRequests.length === 0) {
            return 0;
        }

        await JoinRequest.updateMany(
            { target: teamId, status: "pending" },
            {
                $set: {
                    status: "rejected",
                    handledBy: userId,
                    handledAt: new Date(),
                    message: "Bulk rejected by team management"
                }
            },
            { session }
        );

        const notificationPromises = pendingRequests.map(req =>
            createNotification({
                recipient: req.requester,
                sender: userId,
                type: "REQUEST_DECLINED",
                content: {
                    title: "Request Declined",
                    message: `Your request was declined during a bulk operation.`,
                },
                relatedData: { targetId: teamId, model: "Team" },
            }, { session }).catch(err => console.error("Bulk notification failed for user:", req.requester, err))
        );

        await Promise.all(notificationPromises);

        return pendingRequests.length;
    });

    if (pendingCount === 0) {
        return res.status(200).json({
            success: true,
            message: "No pending requests to clear",
            data: []
        });
    }

    res.status(200).json({
        success: true,
        message: `Cleared ${pendingCount} join requests successfully`,
    });
});
