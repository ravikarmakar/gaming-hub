import fs from "fs";
import mongoose from "mongoose";
import Team from "./team.model.js";
import User from "../user/user.model.js";
import JoinRequest from "../join-request/join-request.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { redis } from "../../shared/config/redis.js";
import { createNotification } from "../notification/notification.controller.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { logger } from "../../shared/utils/logger.js";

// Helper to check uniqueness
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

// --- CRUD Services ---

export const createTeamService = async (userId, body, file) => {
  const { teamName, bio, tag, region } = body;

  try {
    await checkTeamNameUnique(teamName);

    const user = await User.findById(userId);
    if (!user) throw new CustomError("User not found", 404);
    if (user.teamId) throw new CustomError("You are already in a team", 400);
    if (!user.isAccountVerified)
      throw new CustomError("Account is not verified yet", 401);

    // 1. Image handling
    let imageUrl;
    let imageFileId = null;
    if (file) {
      const uploadRes = await uploadOnImageKit(
        file.path,
        `team-logo-${Date.now()}`,
        "/teams/logos"
      );
      if (uploadRes) {
        imageUrl = uploadRes.url;
        imageFileId = uploadRes.fileId;
      }
    }

    const teamData = {
      teamName,
      tag,
      region,
      captain: user._id,
      imageUrl,
      imageFileId,
      bio,
      teamMembers: [
        {
          user: user._id,
          username: user.username,
          avatar: user.avatar,
          roleInTeam: "igl",
        },
      ],
    };

    // 2. Create Team
    const newTeam = new Team(teamData);
    await newTeam.save();

    // 3. Update User
    await User.findByIdAndUpdate(
      userId,
      {
        $set: { teamId: newTeam._id },
        $push: {
          roles: {
            scope: Scopes.TEAM,
            role: Roles.TEAM.OWNER,
            scopeId: newTeam._id,
            scopeModel: "Team",
          },
        },
      }
    );

    // 4. Invalidate user profile cache
    await redis.del(`user_profile:${userId}`);

    return newTeam;
  } catch (error) {
    // Cleanup locally uploaded file if any error occurs
    if (file && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        logger.error("Failed to delete local file:", e);
      }
    }
    throw error;
  }
};

export const updateTeamService = async (teamId, body, files) => {
  const {
    teamName,
    bio,
    tag,
    region,
    isRecruiting,
    twitter,
    discord,
    youtube,
    instagram,
  } = body;

  const team = await Team.findById(teamId);
  if (!team) throw new CustomError("Team not found", 404);

  // Check unique team name if it's being changed
  if (teamName && teamName !== team.teamName) {
    await checkTeamNameUnique(teamName);
    team.teamName = teamName;
  }

  // Handle branding assets update (logo and banner) - PARALLEL UPLOAD
  if (files) {
    const uploadPromises = [];

    if (files.image && files.image[0]) {
      uploadPromises.push(
        (async () => {
          const uploadRes = await uploadOnImageKit(
            files.image[0].path,
            `team-logo-${team._id}-${Date.now()}`,
            "/teams/logos"
          );
          if (uploadRes) {
            if (team.imageFileId) await deleteFromImageKit(team.imageFileId);
            team.imageUrl = uploadRes.url;
            team.imageFileId = uploadRes.fileId;
          }
        })()
      );
    }

    if (files.banner && files.banner[0]) {
      uploadPromises.push(
        (async () => {
          const uploadRes = await uploadOnImageKit(
            files.banner[0].path,
            `team-banner-${team._id}-${Date.now()}`,
            "/teams/banners"
          );
          if (uploadRes) {
            if (team.bannerFileId) await deleteFromImageKit(team.bannerFileId);
            team.bannerUrl = uploadRes.url;
            team.bannerFileId = uploadRes.fileId;
          }
        })()
      );
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }
  }

  // Update text fields
  if (bio !== undefined) team.bio = bio;
  if (tag !== undefined) team.tag = tag;
  if (region !== undefined) team.region = region;

  // Handle boolean string from FormData
  if (isRecruiting !== undefined) {
    team.isRecruiting = isRecruiting === "true" || isRecruiting === true;
  }

  // Update social links
  if (!team.socialLinks) team.socialLinks = {};

  if (twitter !== undefined) team.socialLinks.twitter = twitter || null;
  if (discord !== undefined) team.socialLinks.discord = discord || null;
  if (youtube !== undefined) team.socialLinks.youtube = youtube || null;
  if (instagram !== undefined) team.socialLinks.instagram = instagram || null;

  await team.save();

  // Invalidate Team Cache
  await redis.del(`team_details:${team._id}`);

  return team;
};

export const deleteTeamService = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new CustomError("Team not found", 404);

  // 1. Set teamId = null and remove team roles for all team members (Atomic)
  const memberIds = team.teamMembers.map((member) => member.user);
  await User.updateMany(
    { _id: { $in: memberIds } },
    {
      $set: { teamId: null },
      $pull: {
        roles: {
          scope: "team",
          scopeId: team._id,
        },
      },
    }
  );

  // 2. Soft delete the team (Atomic)
  await Team.findByIdAndUpdate(team._id, {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });

  // 3. Invalidate Redis cache for all members (Pipeline for efficiency)
  const pipeline = redis.pipeline();
  memberIds.forEach((userId) => {
    pipeline.del(`user_profile:${userId}`);
  });
  await pipeline.exec();

  // 4. Async cleanup of related data
  JoinRequest.deleteMany({ target: team._id }).catch(err =>
    logger.error(`Failed to cleanup join requests for team ${team._id}:`, err)
  );

  // 5. Cleanup images from ImageKit to save costs
  if (team.imageFileId) {
    deleteFromImageKit(team.imageFileId);
  }
  if (team.bannerFileId) {
    deleteFromImageKit(team.bannerFileId);
  }

  return true;
};

export const transferTeamOwnershipService = async (teamId, currentOwnerId, newOwnerId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new CustomError("Team not found", 404);

  // Verify current owner
  if (team.captain.toString() !== currentOwnerId.toString()) {
    throw new CustomError("You are not the captain of this team", 403);
  }

  // 1 Check: member team ka hissa hai ya nahi
  const isMember = team.teamMembers.some(
    (m) => m.user.toString() === newOwnerId.toString()
  );

  if (!isMember) {
    throw new CustomError("The selected member is not part of your team.", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(currentOwnerId).session(session); // Old owner

    // 2 Update Team document (captain + teamMembers)
    const updatedMembers = team.teamMembers.map((member) => {
      const uid = member.user.toString();

      if (uid === newOwnerId.toString()) {
        return { ...member.toObject(), roleInTeam: "igl" };
      }

      if (uid === user._id.toString()) {
        return { ...member.toObject(), roleInTeam: "player" };
      }

      return member.toObject();
    });

    await Team.findByIdAndUpdate(
      team._id,
      {
        $set: {
          captain: newOwnerId,
          teamMembers: updatedMembers,
        },
      },
      { session }
    );

    // 3. Update User document (roles) - Old Owner becomes Player
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          roles: [
            // keep all roles EXCEPT the one for this team
            ...user.roles.filter(
              (r) =>
                !(
                  r.scope === "team" &&
                  r.scopeId?.toString() === team._id.toString()
                )
            ),

            // Add new role for this team as PLAYER
            {
              scope: "team",
              role: Roles.TEAM.PLAYER, // "team:player"
              scopeId: team._id,
              scopeModel: "Team",
            },
          ],
        },
      },
      { session }
    );

    // 4. Update New Captain document (roles)
    const newCaptainUser = await User.findById(newOwnerId).session(session);

    await User.findByIdAndUpdate(
      newOwnerId,
      {
        $set: {
          roles: [
            // keep all roles EXCEPT the one for this team
            ...newCaptainUser.roles.filter(
              (r) =>
                !(
                  r.scope === "team" &&
                  r.scopeId?.toString() === team._id.toString()
                )
            ),

            {
              scope: "team",
              role: Roles.TEAM.OWNER, // "team:owner"
              scopeId: team._id,
              scopeModel: "Team",
            },
          ],
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 5. Clear Redis cache
    const pipeline = redis.pipeline();
    pipeline.del(`user_profile:${user._id}`);
    pipeline.del(`user_profile:${newOwnerId}`);
    pipeline.del(`team_details:${teamId}`);
    await pipeline.exec();

    return await getTransformedTeam(teamId);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const manageTeamStaffService = async (teamId, memberId, action) => {
  const team = await Team.findById(teamId);
  if (!team) throw new CustomError("Team not found", 404);

  // Verify member exists in team
  const isMember = team.teamMembers.some(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!isMember) {
    throw new CustomError("The specified user is not a member of the team.", 404);
  }

  // Prevent modifying the Owner (Captain)
  if (team.captain.toString() === memberId.toString()) {
    throw new CustomError("Cannot separate system role for the Team Owner.", 403);
  }

  const user = await User.findById(memberId);
  if (!user) throw new CustomError("User not found", 404);

  if (action === "promote") {
    // Check if already manager
    const alreadyManager = user.roles.some(
      r => r.scope === Scopes.TEAM &&
        r.scopeId.toString() === team._id.toString() &&
        r.role === Roles.TEAM.MANAGER
    );

    if (alreadyManager) {
      return { message: "Member is already a Manager.", team: await getTransformedTeam(team._id) };
    }

    // Add Manager Role
    await User.updateOne(
      { _id: memberId, "roles.scopeId": team._id },
      { $set: { "roles.$.role": Roles.TEAM.MANAGER } }
    );
  } else if (action === "demote") {
    // Remove Manager Role
    await User.updateOne(
      { _id: memberId, "roles.scopeId": team._id },
      { $set: { "roles.$.role": Roles.TEAM.PLAYER } }
    );
  }

  // Invalidate Redis cache
  await redis.del(`user_profile:${memberId}`);
  await redis.del(`team_details:${teamId}`);

  return { message: `Member successfully ${action === "promote" ? "promoted to Manager" : "demoted to Player"}.`, team: await getTransformedTeam(team._id) };
};

export const manageMemberRoleService = async (teamId, memberId, role) => {
  const team = await Team.findById(teamId);
  if (!team) throw new CustomError("Team not found", 404);

  const member = team.teamMembers.find(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!member) {
    throw new CustomError("The specified user is not a member of the team.", 404);
  }

  // Backfill missing denormalized fields if any
  const memberUserIds = team.teamMembers.map(m => m.user);
  const users = await User.find({ _id: { $in: memberUserIds } }).select("username avatar");

  team.teamMembers.forEach(m => {
    const user = users.find(u => u._id.toString() === m.user.toString());
    if (user) {
      if (!m.username) m.username = user.username;
      if (!m.avatar) m.avatar = user.avatar;
    }
  });

  member.roleInTeam = role;
  await team.save();

  // Update Cache
  await redis.del(`team_details:${team._id}`);

  // Invalidate Redis cache for the member
  await redis.del(`user_profile:${memberId}`);

  return { message: `The member's role has been updated to '${role}'.`, team: await getTransformedTeam(team._id) };
};

// --- Existing Helpers & Services ---

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
