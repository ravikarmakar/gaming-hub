import mongoose from "mongoose";
import JoinRequest from "../models/join-request.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { createNotification } from "./notification.controller.js";
import { Roles, Scopes } from "../config/roles.js";
import { redis } from "../config/redisClient.js";

// @desc    Send a request to join a team
// @route   POST /api/v1/teams/:teamId/join-request
export const sendJoinRequest = TryCatchHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const { userId } = req.user;
    const { message } = req.body;

    const user = await User.findById(userId);
    if (user.teamId) {
        throw new CustomError("You are already in a team", 400);
    }

    const team = await Team.findById(teamId);
    if (!team) {
        throw new CustomError("Team not found", 404);
    }

    if (!team.isRecruiting) {
        throw new CustomError("This team is not currently recruiting", 400);
    }

    const existingRequest = await JoinRequest.findOne({
        requester: userId,
        target: teamId,
        status: "pending",
    });

    if (existingRequest) {
        throw new CustomError("You already have a pending request for this team", 400);
    }

    const joinRequest = await JoinRequest.create({
        requester: userId,
        target: teamId,
        targetModel: "Team",
        message: message || `Player ${user.username} wants to join your team.`,
    });

    // Notify Team Captain
    await createNotification({
        recipient: team.captain,
        sender: userId,
        type: "TEAM_JOIN_REQUEST",
        content: {
            title: "New Join Request",
            message: `${user.username} has requested to join your team.`,
        },
        relatedData: {
            teamId: team._id,
            requestId: joinRequest._id,
        },
    });

    res.status(201).json({
        success: true,
        message: "Join request sent successfully",
        joinRequest,
    });
});

// @desc    Get all join requests for a team (Captain only)
// @route   GET /api/v1/teams/join-requests
export const getTeamJoinRequests = TryCatchHandler(async (req, res, next) => {
    const teamId = req.teamDoc._id; // From ensurePartOfTeam middleware

    // Access controlled by verifyTeamPermission(TEAM_ACTIONS.manageRoster) middleware

    const requests = await JoinRequest.find({
        target: teamId,
        status: "pending",
    })
        .populate("requester", "username avatar _id")
        .sort("-createdAt");

    res.status(200).json({
        success: true,
        requests,
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
            if (requester.teamId) throw new CustomError("Requester is already in a team", 400);

            // 1. Update JoinRequest (Atomic)
            await JoinRequest.findByIdAndUpdate(requestId, {
                status: "accepted",
                handledBy: userId,
                handledAt: new Date()
            });

            // 2. Add to team (Atomic)
            const team = joinRequest.target;

            // Check limit
            if (team.teamMembers.length >= 10) {
                throw new CustomError("Team is full (max 10 members). Cannot accept new members.", 400);
            }

            await Team.findByIdAndUpdate(team._id, {
                $push: { teamMembers: { user: requester._id, roleInTeam: "player" } }
            });

            // 3. Update user teamId and roles (Atomic)
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

            // 4. Reject other pending requests for this user (Atomic)
            await JoinRequest.updateMany(
                { requester: requester._id, status: "pending" },
                { status: "rejected", message: "User has joined another team" }
            );

            // Notify Player
            await createNotification({
                recipient: requester._id,
                sender: userId,
                type: "TEAM_JOIN_SUCCESS",
                content: {
                    title: "Request Accepted!",
                    message: `Your request to join ${team.teamName} has been accepted. Welcome!`,
                },
                relatedData: { teamId: team._id },
            });

            // Invalidate Redis cache for new member
            await redis.del(`user_profile:${requester._id}`);

        } else {
            // Rejection logic
            await JoinRequest.findByIdAndUpdate(requestId, {
                status: "rejected",
                handledBy: userId,
                handledAt: new Date()
            });

            // Notify Player
            await createNotification({
                recipient: joinRequest.requester,
                sender: userId,
                type: "TEAM_JOIN_REJECT",
                content: {
                    title: "Request Declined",
                    message: `Your request to join ${joinRequest.target.teamName} was declined.`,
                },
                relatedData: { teamId: joinRequest.target._id },
            });
        }

        // Fetch full team data after update to sync frontend
        const updatedTeamDoc = await Team.findById(joinRequest.target._id)
            .populate("teamMembers.user", "username avatar _id")
            .lean();

        const transformedTeam = {
            ...updatedTeamDoc,
            teamMembers: updatedTeamDoc.teamMembers.map(member => ({
                user: member.user._id,
                roleInTeam: member.roleInTeam,
                username: member.user.username,
                avatar: member.user.avatar,
                joinedAt: member.joinedAt,
                isActive: member.isActive,
            })),
        };

        res.status(200).json({
            success: true,
            message: `Join request ${action} successfully`,
            team: action === "accepted" ? transformedTeam : null
        });
    } catch (error) {
        next(error);
    }
});
