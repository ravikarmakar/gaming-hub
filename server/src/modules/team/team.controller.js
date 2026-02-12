import fs from "fs";
import mongoose from "mongoose";

import Team from "../team/team.model.js";
import User from "../user/user.model.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { findUserById } from "../user/user.service.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import {
  checkTeamNameUnique,
  getTransformedTeam,
  batchAddMembersToTeam,
  removeMemberFromTeam,
  createTeamService,
  updateTeamService,
  deleteTeamService,
  transferTeamOwnershipService,
  manageTeamStaffService,
  manageMemberRoleService
} from "../team/team.service.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { createNotification } from "../notification/notification.controller.js";
import JoinRequest from "../join-request/join-request.model.js";
import { redis } from "../../shared/config/redis.js";
import { logger } from "../../shared/utils/logger.js";

// Helper to remove imports that are no longer needed
// Actually, I kept many imports above because some methods in controller MIGHT stil use them
// But I will strip down the controller heavily.

export const createTeam = TryCatchHandler(async (req, res, next) => {
  const newTeam = await createTeamService(req.user.userId, req.body, req.file);

  res.status(201).json({
    success: true,
    message: "Team created successfully",
    data: newTeam,
  });
});

export const updateTeam = TryCatchHandler(async (req, res, next) => {
  const team = await updateTeamService(req.teamDoc._id, req.body, req.files);

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    data: team,
  });
});

export const fetchTeamDetails = TryCatchHandler(async (req, res, next) => {
  const { teamId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return next(new CustomError("Invalid team ID format", 400));
  }

  // 1. Check Redis Cache
  const cachedTeam = await redis.get(`team_details:${teamId}`);

  if (cachedTeam) {
    try {
      const parsedTeam = typeof cachedTeam === "string" ? JSON.parse(cachedTeam) : cachedTeam;

      // Even if cached, we need to check personal join request status if user logged in
      if (req.user) {
        const existingRequest = await JoinRequest.findOne({
          requester: req.user._id,
          target: teamId,
          status: "pending",
        });
        parsedTeam.hasPendingRequest = !!existingRequest;
      }

      return res.status(200).json({
        success: true,
        message: "Team details fetched successfully (cached)",
        data: parsedTeam,
      });
    } catch (err) {
      logger.error("Redis parse error team details:", err);
    }
  }

  const team = await getTransformedTeam(teamId);

  if (!team) {
    return next(new CustomError("Team not found", 404));
  }

  // Check if the current user (if logged in) has a pending join request
  let hasPendingRequest = false;
  let pendingRequestsCount = 0;

  if (req.user) {
    const existingRequest = await JoinRequest.findOne({
      requester: req.user._id,
      target: teamId,
      status: "pending",
    });
    hasPendingRequest = !!existingRequest;

    const isMember = team.teamMembers.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      pendingRequestsCount = await JoinRequest.countDocuments({
        target: teamId,
        status: "pending",
      });
    }
  }

  const responseData = {
    ...team,
    hasPendingRequest,
    pendingRequestsCount,
  };

  // 2. Set Redis Cache (Post-transformation)
  await redis.set(`team_details:${teamId}`, JSON.stringify(responseData), { ex: 3600 }); // 1 hour

  res.status(200).json({
    success: true,
    message: "Team details fetched successfully",
    data: responseData,
  });
});

export const fetchAllTeams = TryCatchHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    region,
    isRecruiting,
    isVerified,
  } = req.query;
  const skip = (page - 1) * limit;

  // Build query filter
  const query = { isDeleted: false };
  if (search) {
    if (search.length > 2) {
      query.$text = { $search: search };
    } else {
      // Fallback for short terms to verify "starts with"
      query.$or = [
        { teamName: { $regex: `^${search}`, $options: "i" } },
        { tag: { $regex: `^${search}`, $options: "i" } },
      ];
    }
  }
  if (region) query.region = region;
  if (isRecruiting !== undefined) query.isRecruiting = isRecruiting === "true";
  if (isVerified !== undefined) query.isVerified = isVerified === "true";

  // SCALABLE AGGREGATION: No $lookup needed for username/avatar anymore
  const aggregateQuery = [
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(skip) },
    { $limit: parseInt(limit) },
    {
      $project: {
        teamName: 1,
        slug: 1,
        tag: 1,
        imageUrl: 1,
        isVerified: 1,
        isRecruiting: 1,
        region: 1,
        "stats.winRate": 1,
        "teamMembers.username": 1,
        "teamMembers.avatar": 1,
        "teamMembers.user": 1,
        "teamMembers.roleInTeam": 1,
        createdAt: 1,
      },
    },
  ];

  const [teams, totalCount] = await Promise.all([
    Team.aggregate(aggregateQuery),
    Team.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: "Fetched all teams successfully",
    data: teams,
    pagination: {
      totalCount,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      hasMore: totalCount > skip + teams.length,
    },
  });
});

export const addMembers = TryCatchHandler(async (req, res, next) => {
  const { members } = req.body;
  const team = req.teamDoc;

  if (!Array.isArray(members) || members.length < 1)
    throw new CustomError("Please provide at least one team member.", 400);

  // Check Team Limit (Basic check before service call)
  if (team.teamMembers.length + members.length > 20) {
    throw new CustomError(`Team limit exceeded. Max 20 members allowed.`, 400);
  }

  // Use Service Layer for the heavy lifting
  await batchAddMembersToTeam({
    teamId: team._id,
    memberIds: members,
  });

  res.status(200).json({
    success: true,
    message: "Members added successfully to the team.",
  });
});

export const removeMember = TryCatchHandler(async (req, res, next) => {
  logger.info("REMOVE MEMBER REQUEST: " + req.params.id);
  const memberId = req.params.id;
  const { userId } = req.user;
  const team = req.teamDoc;

  if (memberId.toString() === team.captain.toString()) {
    throw new CustomError("Captain cannot remove themselves.", 400);
  }

  // Explicit membership check
  const isMember = team.teamMembers.some((m) => m.user.toString() === memberId.toString());
  if (!isMember) {
    throw new CustomError("User is not a member of this team.", 404);
  }

  // Use Service Layer
  await removeMemberFromTeam({
    teamId: team._id,
    userId: memberId,
  });

  // 4. Notify the removed member
  await createNotification({
    recipient: memberId,
    sender: userId,
    type: "TEAM_KICK",
    content: {
      title: "Kicked from Team",
      message: `You have been removed from the team ${team.teamName} by the captain.`,
    },
    relatedData: {
      teamId: team._id,
    },
  });

  // Fetch updated team roster using helper
  const transformedTeam = await getTransformedTeam(team._id);

  logger.info("REMOVE MEMBER SUCCESS, Sending response.");

  res.status(200).json({
    success: true,
    message: "Member removed successfully.",
    data: transformedTeam
  });
});

export const leaveMember = TryCatchHandler(async (req, res, next) => {
  const { userId } = req.user;

  // Fresh load
  const user = await User.findById(userId);
  if (!user || !user.teamId) {
    throw new CustomError("You are not part of any team.", 400);
  }

  const team = await Team.findById(user.teamId);
  if (!team) {
    // Stale state cleanup
    await User.findByIdAndUpdate(userId, { $set: { teamId: null } });
    return res.status(200).json({ success: true, message: "Team association cleared." });
  }

  // Prevention of captain abandonment
  if (team.captain.toString() === userId.toString()) {
    throw new CustomError(
      "You are the captain. Transfer captaincy or disband the team before leaving.",
      403
    );
  }

  // Use Service Layer
  await removeMemberFromTeam({
    teamId: team._id,
    userId: userId,
  });

  // 3. Notify the captain
  try {
    await createNotification({
      recipient: team.captain,
      sender: userId,
      type: "TEAM_LEAVE",
      content: {
        title: "Member Left Team",
        message: `${user.username} has left the team ${team.teamName}.`,
      },
      relatedData: {
        teamId: team._id,
      },
    });
  } catch (notifErr) {
    logger.error("Notification failed for team member removal:", notifErr);
    // Continue anyway
  }

  res.status(200).json({
    success: true,
    message: "You have successfully left the team.",
  });
});

export const transferTeamOwnerShip = TryCatchHandler(async (req, res, next) => {
  const { memberId } = req.body;
  const team = req.teamDoc;
  const user = req.user; // Current owner

  const transformedTeam = await transferTeamOwnershipService(team._id, user.userId, memberId);

  res.status(200).json({
    success: true,
    message: "Team ownership transferred successfully.",
    data: transformedTeam,
  });
});

export const manageMemberRole = TryCatchHandler(async (req, res, next) => {
  const { memberId, role } = req.body;
  const team = req.teamDoc;

  const { message, team: transformedTeam } = await manageMemberRoleService(team._id, memberId, role);

  res.status(200).json({
    success: true,
    message,
    data: transformedTeam,
  });
});

export const deleteTeam = TryCatchHandler(async (req, res, next) => {
  const team = req.teamDoc;

  await deleteTeamService(team._id);

  res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
});

export const manageStaffRole = TryCatchHandler(async (req, res, next) => {
  const { memberId, action } = req.body; // action: "promote" | "demote"

  const team = req.teamDoc;

  const { message, team: transformedTeam } = await manageTeamStaffService(team._id, memberId, action);

  res.status(200).json({
    success: true,
    message,
    data: transformedTeam
  });
});