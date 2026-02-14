import JoinRequest from "../join-request/join-request.model.js";
import Team from "../team/team.model.js";
import User from "../user/user.model.js";
import Event from "../event/event.model.js";
import EventRegistration from "../event/models/event-registration.model.js";
import Organizer from "../organizer/organizer.model.js";
import mongoose from "mongoose";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { redis } from "../../shared/config/redis.js";
import { addMemberToTeam, getTransformedTeam } from "../team/team.service.js";

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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) throw new CustomError("User not found", 404);

        // 1. Target Model Specific Checks
        if (targetModel === "Team") {
            if (user.teamId) throw new CustomError("You are already in a team", 400);
        } else if (targetModel === "Organizer") {
            if (user.orgId) throw new CustomError("You are already in an organization", 400);
        }

        // 2. Resource Existence and Status Checks
        let resource;
        if (targetModel === "Team") {
            resource = await Team.findById(targetId).session(session);
            if (!resource || resource.isDeleted) throw new CustomError("Team not found", 404);
            if (!resource.isRecruiting) throw new CustomError("This team is not currently recruiting", 400);
        } else if (targetModel === "Organizer") {
            resource = await Organizer.findById(targetId).session(session);
            if (!resource || resource.isDeleted) throw new CustomError("Organization not found", 404);
            if (!resource.isHiring) throw new CustomError("This organization is not currently recruiting", 400);
        } else if (targetModel === "Event") {
            resource = await Event.findById(targetId).session(session);
            if (!resource || resource.isDeleted) throw new CustomError("Event not found", 404);
        }

        // 3. Create Request (unique index prevents duplicates)
        // Use array syntax for transactional creation
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
            // Handle duplicate key error from unique index
            if (error.code === 11000) {
                throw new CustomError(`You already have a pending request for this ${targetModel.toLowerCase()}`, 400);
            }
            throw error;
        }

        // 5. Notify Responsible Party
        let recipientId;
        if (targetModel === "Team") {
            recipientId = resource.captain;
        } else if (targetModel === "Organizer") {
            recipientId = resource.ownerId;
        } else if (targetModel === "Event") {
            // Events may have different ownership fields
            recipientId = resource.orgId ? (await Organizer.findById(resource.orgId).session(session))?.ownerId : (resource.organizerId || resource.createdBy || resource.ownerId);
        }

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

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: "Join request sent successfully",
            joinRequest,
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc    Get all pending join requests for a resource (Team or Org)
// @route   GET /api/v1/teams/join-requests/all
// @route   GET /api/v1/:orgId/join-requests
export const getJoinRequests = TryCatchHandler(async (req, res, next) => {
    // rbacContext is attached by authorize middleware
    const { scopeId, scope } = req.rbacContext;
    const { page = 1, limit = 20 } = req.query;

    // Validate and sanitize pagination params
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Cap at 100
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
        JoinRequest.find({
            target: scopeId,
            status: "pending",
        })
            .populate("requester", "username avatar _id") // Removed email (PII)
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
    let responseData = null;

    if (!["accepted", "rejected"].includes(action)) {
        throw new CustomError("Invalid action. Use 'accepted' or 'rejected'", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const joinRequest = await JoinRequest.findById(requestId).populate("target").session(session);
        if (!joinRequest) {
            throw new CustomError("Join request not found", 404);
        }

        if (joinRequest.status !== "pending") {
            throw new CustomError(`Request has already been ${joinRequest.status}`, 400);
        }

        // Access controlled by verifyTeamPermission(TEAM_ACTIONS.manageRoster) middleware

        if (action === "accepted") {
            const requester = await User.findById(joinRequest.requester).session(session);
            if (!requester) throw new CustomError("Requester not found", 404);

            if (joinRequest.targetModel === "Team") {
                const team = joinRequest.target;

                // Re-check recruiting status
                if (!team || team.isDeleted || !team.isRecruiting) {
                    throw new CustomError("This team is no longer recruiting", 400);
                }

                // Re-check requester hasn't joined another team (race condition)
                if (requester.teamId) {
                    throw new CustomError("Requester has already joined another team", 400);
                }

                // Use Service Layer (must pass session if supported, otherwise manually)
                await addMemberToTeam({
                    teamId: team._id,
                    userId: requester._id,
                    roleInTeam: "player"
                }, { session });

                await createNotification({
                    recipient: requester._id,
                    sender: userId,
                    type: "TEAM_JOIN_SUCCESS",
                    content: { title: "Request Accepted!", message: `You joined ${team.teamName}.` },
                    relatedData: { teamId: team._id },
                }, { session });

                // Fetch updated team for response
                responseData = await getTransformedTeam(team._id);

            } else if (joinRequest.targetModel === "Organizer") {
                if (requester.orgId) throw new CustomError("Requester is already in an organization", 400);
                const org = joinRequest.target;
                if (!org || org.isDeleted) throw new CustomError("Organization no longer exists", 404);

                await User.findByIdAndUpdate(requester._id, {
                    $set: { orgId: org._id },
                    $push: {
                        roles: {
                            scope: Scopes.ORG,
                            role: Roles.ORG.PLAYER,
                            scopeId: org._id,
                            scopeModel: "Organizer",
                        }
                    }
                }, { session });

                await createNotification({
                    recipient: requester._id,
                    sender: userId,
                    type: "ORG_JOIN_SUCCESS",
                    content: { title: "Request Accepted!", message: `Your request to join ${org.name} has been accepted. Welcome!` },
                    relatedData: { orgId: org._id },
                }, { session });

            } else if (joinRequest.targetModel === "Event") {
                if (!requester.teamId) throw new CustomError("Requester must have a team to join events", 400);
                const event = joinRequest.target;
                if (!event || event.isDeleted) throw new CustomError("Event no longer exists", 404);

                // Fail Fast: Check Team Validity
                const team = await Team.findById(requester.teamId).session(session);
                if (!team) throw new CustomError("Team not found", 404);

                // Atomic increment with slot validation first
                const updatedEvent = await Event.findOneAndUpdate(
                    {
                        _id: event._id,
                        $expr: {
                            $or: [
                                { $eq: ["$maxSlots", null] }, // No limit
                                { $lt: ["$joinedSlots", "$maxSlots"] } // Has available slots
                            ]
                        }
                    },
                    { $inc: { joinedSlots: 1 } },
                    { new: true, session }
                );

                if (!updatedEvent) {
                    throw new CustomError("Event is full. Registration could not be completed.", 400);
                }

                // Identify Core Roles and Substitutes
                const coreRoles = ["igl", "rusher", "sniper", "support"];
                const players = [];
                const substitutes = [];
                const foundCoreRoles = new Set();

                team.teamMembers.forEach(member => {
                    if (member.isActive) {
                        if (coreRoles.includes(member.roleInTeam)) {
                            players.push(member.user);
                            foundCoreRoles.add(member.roleInTeam);
                        } else {
                            substitutes.push(member.user);
                        }
                    }
                });

                if (foundCoreRoles.size < 4) {
                    throw new CustomError("Team must have an IGL, Rusher, Sniper, and Support to join.", 400);
                }

                // Create EventRegistration
                await EventRegistration.create([{
                    eventId: event._id,
                    teamId: requester.teamId,
                    status: "approved",
                    players,
                    substitutes,
                }], { session });

                await createNotification({
                    recipient: requester._id,
                    sender: userId,
                    type: "EVENT_REGISTRATION_SUCCESS",
                    content: { title: "Deployment Approved!", message: `Your team joined ${event.title}.` },
                    relatedData: { eventId: event._id },
                }, { session });
            }

            // Update JoinRequest status inside transaction
            joinRequest.status = "accepted";
            joinRequest.handledBy = userId;
            joinRequest.handledAt = new Date();
            await joinRequest.save({ session });

            // Handle side effects (rejections of other requests) inside transaction
            if (["Team", "Organizer"].includes(joinRequest.targetModel)) {
                await JoinRequest.updateMany(
                    {
                        requester: requester._id,
                        targetModel: joinRequest.targetModel,
                        status: "pending",
                        _id: { $ne: requestId }
                    },
                    {
                        $set: {
                            status: "rejected",
                            message: `User has joined another ${joinRequest.targetModel.toLowerCase()}`,
                            handledBy: userId,
                            handledAt: new Date()
                        }
                    },
                    { session }
                );

                try {
                    await redis.del(`user_profile:${requester._id}`);
                } catch (cacheErr) {
                    // Log but don't fail transaction
                    console.warn(`Failed to invalidate cache for user ${requester._id}:`, cacheErr);
                }
            }

        } else {
            // Rejection logic for all
            joinRequest.status = "rejected";
            joinRequest.handledBy = userId;
            joinRequest.handledAt = new Date();
            await joinRequest.save({ session });

            await createNotification({
                recipient: joinRequest.requester,
                sender: userId,
                type: "REQUEST_DECLINED",
                content: {
                    title: "Request Declined",
                    message: `Your request for ${joinRequest.targetModel.toLowerCase()} access was declined.`,
                },
                relatedData: { targetId: joinRequest.target._id, model: joinRequest.targetModel },
            }, { session });
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `Request ${action} successfully`,
            data: responseData
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});

// @desc    Bulk reject all pending join requests for a resource
// @route   DELETE /api/v1/teams/:teamId/join-requests/clear-all
export const bulkRejectJoinRequests = TryCatchHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const { userId } = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find all pending requests for this team
        const pendingRequests = await JoinRequest.find({
            target: teamId,
            status: "pending",
        }).session(session);

        if (pendingRequests.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({
                success: true,
                message: "No pending requests to clear",
                data: []
            });
        }

        // 2. Update all to rejected
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

        // 3. Notify all requesters (Best effort)
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

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `Cleared ${pendingRequests.length} join requests successfully`,
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});
