import mongoose from "mongoose";
import JoinRequest from "../models/join-request.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import EventRegistration from "../models/event-model/event-registration.model.js";
import Organizer from "../models/organizer.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { createNotification } from "./notification.controller.js";
import { Roles, Scopes } from "../constants/roles.js";
import { redis } from "../config/redis.js";

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

    const user = await User.findById(userId);
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
        resource = await Team.findById(targetId);
        if (!resource || resource.isDeleted) throw new CustomError("Team not found", 404);
        if (!resource.isRecruiting) throw new CustomError("This team is not currently recruiting", 400);
    } else if (targetModel === "Organizer") {
        resource = await Organizer.findById(targetId);
        if (!resource || resource.isDeleted) throw new CustomError("Organization not found", 404);
        if (!resource.isHiring) throw new CustomError("This organization is not currently recruiting", 400);
    } else if (targetModel === "Event") {
        resource = await Event.findById(targetId);
        if (!resource || resource.isDeleted) throw new CustomError("Event not found", 404);
    }

    // 3. Duplicate Request Check
    const existingRequest = await JoinRequest.findOne({
        requester: userId,
        target: targetId,
        status: "pending",
    });

    if (existingRequest) {
        throw new CustomError(`You already have a pending request for this ${targetModel.toLowerCase()}`, 400);
    }

    // 4. Create Request
    const joinRequest = await JoinRequest.create({
        requester: userId,
        target: targetId,
        targetModel: targetModel,
        message: message || `${targetModel} join request from ${user.username}`,
    });

    // 5. Notify Responsible Party
    const recipientId = targetModel === "Team" ? resource.captain : resource.ownerId; // Or specific event manager if applicable

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
        });
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

    const requests = await JoinRequest.find({
        target: scopeId,
        status: "pending",
    })
        .populate("requester", "username avatar _id email")
        .sort("-createdAt");

    res.status(200).json({
        success: true,
        message: "Join requests fetched successfully",
        data: requests,
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

    const joinRequest = await JoinRequest.findById(requestId).populate("target");
    if (!joinRequest) {
        throw new CustomError("Join request not found", 404);
    }

    if (joinRequest.status !== "pending") {
        throw new CustomError(`Request has already been ${joinRequest.status}`, 400);
    }

    // Access controlled by verifyTeamPermission(TEAM_ACTIONS.manageRoster) middleware

    try {
        if (action === "accepted") {
            const requester = await User.findById(joinRequest.requester);
            if (!requester) throw new CustomError("Requester not found", 404);

            if (joinRequest.targetModel === "Team") {
                if (requester.teamId) throw new CustomError("Requester is already in a team", 400);
                const team = joinRequest.target;

                if (team.teamMembers.length >= 10) {
                    throw new CustomError("Team is full (max 10 members).", 400);
                }

                await Team.findByIdAndUpdate(team._id, {
                    $push: { teamMembers: { user: requester._id, roleInTeam: "player" } }
                });

                await User.findByIdAndUpdate(requester._id, {
                    $set: { teamId: team._id },
                    $push: {
                        roles: {
                            scope: Scopes.TEAM,
                            role: Roles.TEAM.PLAYER,
                            scopeId: team._id,
                            scopeModel: "Team",
                        }
                    }
                });

                await createNotification({
                    recipient: requester._id,
                    sender: userId,
                    type: "TEAM_JOIN_SUCCESS",
                    content: { title: "Request Accepted!", message: `You joined ${team.teamName}.` },
                    relatedData: { teamId: team._id },
                });

            } else if (joinRequest.targetModel === "Organizer") {
                if (requester.orgId) throw new CustomError("Requester is already in an organization", 400);
                const org = joinRequest.target;

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
                });

                await createNotification({
                    recipient: requester._id,
                    sender: userId,
                    type: "ORG_JOIN_SUCCESS",
                    content: { title: "Request Accepted!", message: `Your request to join ${org.name} has been accepted. Welcome!` },
                    relatedData: { orgId: org._id },
                });

            } else if (joinRequest.targetModel === "Event") {
                if (!requester.teamId) throw new CustomError("Requester must have a team to join events", 400);
                const event = await Event.findById(joinRequest.target);
                if (!event) throw new CustomError("Event not found", 404);

                const team = await Team.findById(requester.teamId);
                if (!team) throw new CustomError("Team not found", 404);

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
                await EventRegistration.create({
                    eventId: event._id,
                    teamId: requester.teamId,
                    status: "approved",
                    players,
                    substitutes,
                });

                event.joinedSlots = (event.joinedSlots || 0) + 1;
                await event.save();

                await createNotification({
                    recipient: requester._id,
                    sender: userId,
                    type: "EVENT_REGISTRATION_SUCCESS",
                    content: { title: "Deployment Approved!", message: `Your team joined ${event.title}.` },
                    relatedData: { eventId: event._id },
                });
            }

            // Update JoinRequest status common for all
            await JoinRequest.findByIdAndUpdate(requestId, {
                status: "accepted",
                handledBy: userId,
                handledAt: new Date()
            });

            // Handle any side effects like rejecting other requests if user joined one
            if (["Team", "Organizer"].includes(joinRequest.targetModel)) {
                await JoinRequest.updateMany(
                    { requester: requester._id, targetModel: joinRequest.targetModel, status: "pending" },
                    { status: "rejected", message: `User has joined another ${joinRequest.targetModel.toLowerCase()}` }
                );
                await redis.del(`user_profile:${requester._id}`);
            }

        } else {
            // Rejection logic for all
            await JoinRequest.findByIdAndUpdate(requestId, {
                status: "rejected",
                handledBy: userId,
                handledAt: new Date()
            });

            await createNotification({
                recipient: joinRequest.requester,
                sender: userId,
                type: "REQUEST_DECLINED",
                content: {
                    title: "Request Declined",
                    message: `Your request for ${joinRequest.targetModel.toLowerCase()} access was declined.`,
                },
                relatedData: { targetId: joinRequest.target._id, model: joinRequest.targetModel },
            });
        }

        res.status(200).json({
            success: true,
            message: `Request ${action} successfully`,
        });
    } catch (error) {
        next(error);
    }
});
