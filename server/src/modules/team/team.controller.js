import mongoose from "mongoose";

import Team from "../team/team.model.js";
import User from "../user/user.model.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import {
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
import { createNotification } from "../notification/notification.controller.js";
import JoinRequest from "../join-request/join-request.model.js";
import { redis } from "../../shared/config/redis.js";
import { logger } from "../../shared/utils/logger.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { invalidateRbacCache } from "../../shared/middleware/rbac.middleware.js";
import {
  emitMemberJoined,
  emitMemberLeft,
  emitRoleUpdated,
  emitOwnerTransferred,
  emitTeamUpdated,
  emitTeamDeleted
} from "./team.socket.js";
import { emitProfileUpdate } from "../user/user.socket.js";

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

  // Emit socket event for team update (e.g., recruiting status changed)
  emitTeamUpdated(team._id, "settings", team);

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    data: team,
  });
});

export const fetchTeamDetails = TryCatchHandler(async (req, res, next) => {
  const { teamId } = req.params;
  const skipCache = req.query.skipCache === "true";

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return next(new CustomError("Invalid team ID format", 400));
  }

  // 1. Check Redis Cache
  const cachedTeam = skipCache ? null : await redis.get(`team_details:${teamId}`);

  let team;
  if (cachedTeam) {
    try {
      team = typeof cachedTeam === "string" ? JSON.parse(cachedTeam) : cachedTeam;
    } catch (err) {
      logger.error("Redis parse error team details:", err);
      // Self-heal: Delete the corrupted key
      await redis.del(`team_details:${teamId}`);

      // Fallback to DB if parse fails
      team = await getTransformedTeam(teamId);
      if (!team) {
        return next(new CustomError("Team not found", 404));
      }
    }
  } else {
    team = await getTransformedTeam(teamId);
    if (!team) {
      return next(new CustomError("Team not found", 404));
    }

    // 2. Set Redis Cache (team data only, no user-specific fields)
    await redis.set(`team_details:${teamId}`, JSON.stringify(team), { ex: 3600 }); // 1 hour
  }



  // Compute user-specific data on-demand (not cached)
  let hasPendingRequest = false;
  let pendingRequestsCount = 0;

  if (req.user) {
    const existingRequest = await JoinRequest.findOne({
      requester: req.user.userId,
      target: teamId,
      status: "pending",
    });
    hasPendingRequest = !!existingRequest;

    const isMember = team.teamMembers.some(
      (m) => m.user?.toString() === req.user.userId.toString()
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

  // Parse to integers early to prevent type coercion issues
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  // Helper to escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Build query filter
  const query = { isDeleted: false };
  if (search) {
    if (search.length > 2) {
      query.$text = { $search: search };
    } else {
      // Escape regex to prevent injection
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { teamName: { $regex: `^${escapedSearch}`, $options: "i" } },
        { tag: { $regex: `^${escapedSearch}`, $options: "i" } },
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
    { $skip: skip },
    { $limit: parsedLimit },
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
      currentPage: parsedPage,
      limit: parsedLimit,
      hasMore: totalCount > skip + teams.length,
    },
  });
});

export const addMembers = TryCatchHandler(async (req, res, next) => {
  const { members } = req.body;
  const team = req.teamDoc;

  if (!Array.isArray(members) || members.length < 1)
    throw new CustomError("Please provide at least one team member.", 400);

  // Use Service Layer for the heavy lifting
  // Service should ideally verify limit atomically, but for now this is acceptable
  await batchAddMembersToTeam({
    teamId: team._id,
    memberIds: members,
  });

  // Emit socket event for each added member
  try {
    const addedUsers = await User.find({ _id: { $in: members } }).select("username avatar");
    addedUsers.forEach(user => {
      emitMemberJoined(team._id, {
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        roleInTeam: "player",
      });
    });
  } catch (socketErr) {
    logger.warn("Failed to emit socket events for batch added members:", socketErr.message);
  }

  res.status(200).json({
    success: true,
    message: "Members added successfully to the team.",
  });
});

export const removeMember = TryCatchHandler(async (req, res, next) => {

  const memberId = req.params.id;
  const { userId } = req.user;
  const team = req.teamDoc;

  if (memberId.toString() === team.captain.toString()) {
    throw new CustomError("Captain cannot remove themselves.", 400);
  }

  // Explicit membership check
  const isMember = team.teamMembers.some((m) => m.user?.toString() === memberId.toString());
  if (!isMember) {
    throw new CustomError("User is not a member of this team.", 404);
  }

  // 1. Security Check: Only Captains can remove staff (managers/coaches).
  // Managers can only remove 'players'.
  const targetMember = team.teamMembers.find(m => m.user?.toString() === memberId.toString());
  const rbacRole = req.rbacContext?.role; // current user's role: team:owner or team:manager

  if (rbacRole === Roles.TEAM.MANAGER) {
    // Managers can NEVER remove the Captain or other Managers.
    // We check their system-level role within the team.
    const targetUser = await User.findById(memberId).select("roles");
    if (!targetUser) {
      throw new CustomError("Target user not found.", 404);
    }

    const targetSystemRole = targetUser.roles?.find(r => r.scopeId?.toString() === team._id.toString())?.role;

    if (targetSystemRole !== Roles.TEAM.PLAYER) {
      throw new CustomError("Managers can only remove members with the Player role.", 403);
    }
  }

  // Use Service Layer
  await removeMemberFromTeam({
    teamId: team._id,
    userId: memberId,
  });

  // Emit socket event for member removal
  emitMemberLeft(team._id, memberId, "removed");

  // 4. Notify the removed member
  try {
    const actorRole = rbacRole === Roles.TEAM.OWNER ? "captain" : "manager";
    await createNotification({
      recipient: memberId,
      sender: userId,
      type: "TEAM_KICK",
      content: {
        title: "Kicked from Team",
        message: `You have been removed from the team ${team.teamName} by the team ${actorRole}.`,
      },
      relatedData: {
        teamId: team._id,
      },
    });
  } catch (error) {
    logger.error("Notification failed for team member removal:", error);
  }

  // Fetch updated team roster using helper
  const transformedTeam = await getTransformedTeam(team._id);



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

  // Emit socket event for member leaving
  emitMemberLeft(team._id, userId, "left");

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

  // Emit socket event for ownership transfer
  emitOwnerTransferred(team._id, memberId, user.userId);

  // Invalidate RBAC cache to ensure next operation uses updated roles
  invalidateRbacCache(Scopes.TEAM, team._id);

  // Emit profile updates for real-time refresh
  emitProfileUpdate(memberId, { teamId: team._id, action: "role_changed" });
  emitProfileUpdate(user.userId, { teamId: team._id, action: "role_changed" });

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

  // Get old role for logging/sync purposes
  const oldRole = team.teamMembers.find(m => m.user?.toString() === memberId.toString())?.roleInTeam;

  // Emit socket event for role update
  emitRoleUpdated(team._id, memberId, role, oldRole);

  // Invalidate RBAC cache
  invalidateRbacCache(Scopes.TEAM, team._id);

  // Emit profile update for real-time refresh
  emitProfileUpdate(memberId, { teamId: team._id, action: "role_changed" });

  res.status(200).json({
    success: true,
    message,
    data: transformedTeam,
  });
});

export const deleteTeam = TryCatchHandler(async (req, res, next) => {
  const team = req.teamDoc;

  await deleteTeamService(team._id);

  // Emit socket event for team deletion
  emitTeamDeleted(team._id);

  // Invalidate RBAC cache for the team
  invalidateRbacCache(Scopes.TEAM, team._id);

  res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
});

export const manageStaffRole = TryCatchHandler(async (req, res, next) => {
  const { memberId, action } = req.body; // action: "promote" | "demote"

  const team = req.teamDoc;

  const { message, team: transformedTeam } = await manageTeamStaffService(team._id, memberId, action);

  // Find the member in the updated team to get their new actual role
  const updatedMember = transformedTeam.teamMembers?.find(m => (m.user?._id || m.user)?.toString() === memberId.toString());
  const newRole = updatedMember?.roleInTeam || (action === "promote" ? "manager" : "player");
  const oldRole = team.teamMembers.find(m => m.user?.toString() === memberId.toString())?.roleInTeam;

  // Emit socket event for staff role update
  emitRoleUpdated(team._id, memberId, newRole, oldRole);

  // Invalidate RBAC cache
  invalidateRbacCache(Scopes.TEAM, team._id);

  // Emit profile update for real-time refresh
  emitProfileUpdate(memberId, { teamId: team._id, action: "role_changed" });

  res.status(200).json({
    success: true,
    message,
    data: transformedTeam
  });
});