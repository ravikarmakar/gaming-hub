import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import { CustomError } from "../utils/CustomError.js";
import { Roles, Scopes } from "../constants/roles.js";
import { redis } from "../config/redis.js";
import { createNotification } from "../controllers/notification.controller.js";
import mongoose from "mongoose";

export const checkTeamNameUnique = async (teamName) => {
  const existingTeam = await Team.findOne({ teamName });
  if (existingTeam) {
    throw new CustomError(
      "Team name already exists. Please choose a different name.",
      409
    );
  }
  return true;
};

export const createNewTeam = async (teamData) => {
  const newTeam = new Team(teamData);
  await newTeam.save();
  return newTeam;
};

export const findTeamById = async (id) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new CustomError("Team not found", 404);
  }
  return team;
};

export const findTeamByIdLean = async (id, selectFields = null) => {
  let query = Team.findOne({ _id: id, isDeleted: false }).lean();
  if (selectFields) {
    query = query.select(selectFields);
  }
  const team = await query;
  if (!team) {
    throw new CustomError("Team not found", 404);
  }
  return team;
};

export const teamExists = async (id) => {
  const exists = await Team.exists({ _id: id, isDeleted: false });
  return Boolean(exists);
};

/**
 * Helper to fetch a fully populated and transformed team
 * used by multiple members/staff management controllers.
 */
export const getTransformedTeam = async (teamId) => {
  const team = await Team.findOne({ _id: teamId, isDeleted: false })
    .select("-__v")
    .lean();

  if (!team) return null;

  // With denormalized data, we don't need to populate 'user' just for username/avatar
  // But we still need system roles from the User model because they are scope-dependent
  // and might change independently of the team roster.
  const userIds = team.teamMembers.map((m) => m.user);
  const users = await User.find({ _id: { $in: userIds } })
    .select("roles _id username avatar")
    .lean();

  return {
    ...team,
    teamMembers: team.teamMembers.map((m) => {
      const userObj = users.find((u) => u._id.toString() === m.user.toString());
      return {
        ...m,
        username: m.username || userObj?.username || "Unknown",
        avatar: m.avatar || userObj?.avatar || "",
        systemRole:
          userObj?.roles.find(
            (r) =>
              r.scope === "team" && r.scopeId?.toString() === teamId.toString()
          )?.role || "player",
      };
    }),
  };
};

/**
 * Service to add a single member to a team (Scalable/Reusable)
 */
export const addMemberToTeam = async ({ teamId, userId, roleInTeam = "player", session = null }) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw new CustomError("User not found", 404);
  if (user.teamId) throw new CustomError(`${user.username} is already in a team`, 400);

  const team = await Team.findById(teamId).session(session);
  if (!team) throw new CustomError("Team not found", 404);

  // 1. Update Team Roster with denormalized data
  await Team.findByIdAndUpdate(
    teamId,
    {
      $push: {
        teamMembers: {
          user: userId,
          username: user.username,
          avatar: user.avatar,
          roleInTeam,
        },
      },
    },
    { session }
  );

  // 2. Update User Roles & Team ID
  await User.findByIdAndUpdate(
    userId,
    {
      $set: { teamId: teamId },
      $push: {
        roles: {
          scope: Scopes.TEAM,
          role: Roles.TEAM.PLAYER,
          scopeId: teamId,
          scopeModel: "Team",
        },
      },
    },
    { session }
  );

  // 3. Cache Invalidation (Post-commit if sessions used, handled by caller)
  if (!session) {
    await redis.del(`user_profile:${userId}`);
    await redis.del(`team_details:${teamId}`);
  }

  return true;
};

/**
 * Service to batch add members to a team
 */
export const batchAddMembersToTeam = async ({ teamId, memberIds, session = null }) => {
  const team = await Team.findById(teamId).session(session);
  if (!team) throw new CustomError("Team not found", 404);

  const users = await User.find({ _id: { $in: memberIds } }).session(session);
  if (users.length !== memberIds.length) throw new CustomError("One or more users not found", 404);

  const bulkOps = [];
  const teamUpdateOps = [];

  for (const user of users) {
    if (user.teamId) throw new CustomError(`${user.username} is already in a team`, 400);

    // User Bulk Ops
    bulkOps.push({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: { teamId: teamId },
          $push: {
            roles: {
              scope: Scopes.TEAM,
              role: Roles.TEAM.PLAYER,
              scopeId: teamId,
              scopeModel: "Team",
            },
          },
        },
      },
    });

    // Team Roster Ops
    teamUpdateOps.push({
      user: user._id,
      username: user.username,
      avatar: user.avatar,
      roleInTeam: "player",
    });
  }

  // Execute Updates
  if (bulkOps.length > 0) {
    await User.bulkWrite(bulkOps, { session });
    await Team.findByIdAndUpdate(
      teamId,
      { $push: { teamMembers: { $each: teamUpdateOps } } },
      { session }
    );
  }

  // Cache Invalidation
  if (!session) {
    const pipeline = redis.pipeline();
    memberIds.forEach((mid) => pipeline.del(`user_profile:${mid}`));
    pipeline.del(`team_details:${teamId}`);
    await pipeline.exec();
  }

  return true;
};

/**
 * Sync team rosters when a user updates their profile (Scalability Hook)
 */
export const syncUserInTeams = async (userId, { username, avatar }) => {
  const updateData = {};
  if (username) updateData["teamMembers.$[elem].username"] = username;
  if (avatar) updateData["teamMembers.$[elem].avatar"] = avatar;

  if (Object.keys(updateData).length === 0) return;

  await Team.updateMany(
    { "teamMembers.user": userId },
    { $set: updateData },
    { arrayFilters: [{ "elem.user": userId }] }
  );
};

/**
 * Service to remove a member from a team
 */
export const removeMemberFromTeam = async ({ teamId, userId, session = null }) => {
  const team = await Team.findById(teamId).session(session);
  if (!team) throw new CustomError("Team not found", 404);

  // 1. Remove from Team Roster
  await Team.findByIdAndUpdate(
    teamId,
    { $pull: { teamMembers: { user: userId } } },
    { session }
  );

  // 2. Clear User Team Data & Roles
  await User.findByIdAndUpdate(
    userId,
    {
      $set: { teamId: null },
      $pull: {
        roles: {
          scope: Scopes.TEAM,
          scopeId: teamId,
        },
      },
    },
    { session }
  );

  // 3. Cache Invalidation
  if (!session) {
    await redis.del(`user_profile:${userId}`);
    await redis.del(`team_details:${teamId}`);
  }

  return true;
};
