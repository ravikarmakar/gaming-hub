import fs from "fs";
import Team from "./team.model.js";
import User from "../user/user.model.js";
import JoinRequest from "../join-request/join-request.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { redis } from "../../shared/config/redis.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { logger } from "../../shared/utils/logger.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { invalidateCacheWithRetry } from "../../shared/utils/cache.js";

// --- Cache Helpers (Risk Mitigation) ---

/**
 * Sync user denormalized data in team rosters with retry logic
 * Addresses Risk: Data Consistency from sync failures
 */
const syncUserInTeamsWithRetry = async (userId, { username, avatar }, options = {}) => {
  const { maxRetries = 3, retryDelay = 200 } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const updateData = {};
      if (username) updateData["teamMembers.$[elem].username"] = username;
      if (avatar) updateData["teamMembers.$[elem].avatar"] = avatar;

      if (Object.keys(updateData).length === 0) return true;

      await Team.updateMany(
        { "teamMembers.user": userId },
        { $set: updateData },
        { arrayFilters: [{ "elem.user": userId }] }
      );

      if (attempt > 1) {
        logger.info(`Team denormalization sync succeeded on attempt ${attempt} for user ${userId}`);
      }
      return true;
    } catch (error) {
      logger.error(`Team sync attempt ${attempt}/${maxRetries} failed for user ${userId}:`, error);

      if (attempt === maxRetries) {
        // Log critical failure but don't block the main operation
        logger.error(`CRITICAL: Team denormalization sync failed after ${maxRetries} attempts for user ${userId}. Manual intervention may be needed.`);
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  return false;
};

// Helper to check uniqueness (Initial check, relies on DB unique index for strict guarantee)
export const checkTeamNameUnique = async (teamName, session = null) => {
  const query = Team.findOne({ teamName, isDeleted: false });
  if (session) {
    query.session(session);
  }
  const existingTeam = await query;

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

  // 0. Pre-validation (Fail early to avoid unnecessary upload)
  await checkTeamNameUnique(teamName);

  const userPreCheck = await User.findById(userId);
  if (!userPreCheck) throw new CustomError("User not found", 404);
  if (userPreCheck.teamId) throw new CustomError("You are already in a team", 400);
  if (!userPreCheck.isAccountVerified)
    throw new CustomError("Account is not verified yet", 401);

  // 1. Image handling (External Service - Outside Transaction)
  let imageUrl;
  let imageFileId = null;
  let uploadedImageStart = null;

  if (file) {
    const uploadRes = await uploadOnImageKit(
      file.path,
      `team-logo-${Date.now()}`,
      "/teams/logos"
    );
    if (uploadRes) {
      imageUrl = uploadRes.url;
      imageFileId = uploadRes.fileId;
      uploadedImageStart = imageFileId; // Track for cleanup
    }
  }

  try {
    const newTeam = await withOptionalTransaction(async (session) => {
      // Lock the user to ensure they haven't joined a team in the meantime
      const userQuery = User.findById(userId);
      if (session) userQuery.session(session);
      const user = await userQuery;
      if (!user) throw new CustomError("User not found", 404);
      if (user.teamId) throw new CustomError("You are already in a team", 400);

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
      await newTeam.save({ session });

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
        },
        { session }
      );

      return newTeam;
    });

    // 4. Invalidate user profile cache (with retry logic)
    await invalidateCacheWithRetry(`user_profile:${userId}`);

    // Clean up local file only after success
    if (file && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) { logger.error("Failed to delete local file:", e); }
    }

    return newTeam;
  } catch (error) {
    // Rollback ImageKit upload if DB failed
    if (uploadedImageStart) {
      await deleteFromImageKit(uploadedImageStart).catch(err =>
        logger.error(`Failed to rollback ImageKit upload ${uploadedImageStart}:`, err)
      );
    }

    // Cleanup locally uploaded file
    if (file && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) { logger.error("Failed to delete local file:", e); }
    }

    // Handle Duplicate Key Error (TOCTOU fix)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.teamName) {
      throw new CustomError("Team name already exists. Please choose a different name.", 409);
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

  // Track potential new uploads to clean up if DB update fails
  let newImageFileId = null;
  let newBannerFileId = null;

  try {
    const team = await Team.findOne({ _id: teamId, isDeleted: false });
    if (!team) throw new CustomError("Team not found", 404);

    // Check unique team name if it's being changed
    if (teamName && teamName !== team.teamName) {
      await checkTeamNameUnique(teamName);
      team.teamName = teamName;
    }

    // Handle branding assets update (logo and banner) - PARALLEL UPLOAD
    let oldImageFileId = null;
    let oldBannerFileId = null;

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
              oldImageFileId = team.imageFileId; // Store for later deletion
              team.imageUrl = uploadRes.url;
              team.imageFileId = uploadRes.fileId;
              newImageFileId = uploadRes.fileId; // Track new upload
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
              oldBannerFileId = team.bannerFileId; // Store for later deletion
              team.bannerUrl = uploadRes.url;
              team.bannerFileId = uploadRes.fileId;
              newBannerFileId = uploadRes.fileId; // Track new upload
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

    // Invalidate Team Cache (with retry logic)
    await invalidateCacheWithRetry(`team_details:${team._id}`);

    // Async cleanup of old images AFTER successful save
    if (oldImageFileId) {
      deleteFromImageKit(oldImageFileId).catch(err =>
        logger.error(`Failed to delete old team logo ${oldImageFileId}:`, err)
      );
    }
    if (oldBannerFileId) {
      deleteFromImageKit(oldBannerFileId).catch(err =>
        logger.error(`Failed to delete old team banner ${oldBannerFileId}:`, err)
      );
    }

    return await buildTransformedTeamFromDoc(team);
  } catch (err) {
    // Cleanup locally uploaded files first
    if (files) {
      if (files.image && files.image[0] && fs.existsSync(files.image[0].path)) {
        try { fs.unlinkSync(files.image[0].path); } catch (e) { logger.error("Failed to delete local file:", e); }
      }
      if (files.banner && files.banner[0] && fs.existsSync(files.banner[0].path)) {
        try { fs.unlinkSync(files.banner[0].path); } catch (e) { logger.error("Failed to delete local file:", e); }
      }
    }
    // Cleanup newly uploaded ImageKit files if DB save failed (Orphaned Object Fix)
    if (newImageFileId) {
      deleteFromImageKit(newImageFileId).catch(e => logger.error(`Failed to delete orphaned logo ${newImageFileId}`, e));
    }
    if (newBannerFileId) {
      deleteFromImageKit(newBannerFileId).catch(e => logger.error(`Failed to delete orphaned banner ${newBannerFileId}`, e));
    }

    throw err;
  }
};

export const deleteTeamService = async (teamId) => {
  const team = await Team.findOne({ _id: teamId, isDeleted: false });
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
  // Also invalidate team details
  pipeline.del(`team_details:${teamId}`);
  await pipeline.exec();

  // 4. Async cleanup of related data
  JoinRequest.deleteMany({ target: team._id }).catch(err =>
    logger.error(`Failed to cleanup join requests for team ${team._id}:`, err)
  );

  // 5. Cleanup images from ImageKit to save costs
  if (team.imageFileId) {
    deleteFromImageKit(team.imageFileId).catch(err => logger.error(`Failed to delete team logo ${team.imageFileId}`, err));
  }
  if (team.bannerFileId) {
    deleteFromImageKit(team.bannerFileId).catch(err => logger.error(`Failed to delete team banner ${team.bannerFileId}`, err));
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

  const updatedTeam = await withOptionalTransaction(async (session) => {
    const userQuery = User.findById(currentOwnerId);
    if (session) userQuery.session(session);
    const user = await userQuery; // Old owner

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

    const updatedTeam = await Team.findByIdAndUpdate(
      team._id,
      {
        $set: {
          captain: newOwnerId,
          teamMembers: updatedMembers,
        },
      },
      { session, new: true, lean: true }
    );

    // 3. Update User document (roles) - Old Owner becomes Player
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          "roles.$[elem].role": Roles.TEAM.PLAYER
        }
      },
      {
        session,
        arrayFilters: [{
          "elem.scope": "team",
          "elem.scopeId": team._id
        }]
      }
    );

    // 4. Update New Captain document (roles)
    await User.findByIdAndUpdate(
      newOwnerId,
      {
        $pull: {
          roles: {
            scope: "team",
            scopeId: team._id
          }
        }
      },
      { session }
    );

    await User.findByIdAndUpdate(
      newOwnerId,
      {
        $push: {
          roles: {
            scope: "team",
            role: Roles.TEAM.OWNER,
            scopeId: team._id,
            scopeModel: "Team",
          }
        }
      },
      { session }
    );
    return updatedTeam;
  });

  // 5. Clear Redis cache
  const pipeline = redis.pipeline();
  pipeline.del(`user_profile:${currentOwnerId}`);
  pipeline.del(`user_profile:${newOwnerId}`);
  pipeline.del(`team_details:${teamId}`);
  await pipeline.exec();

  return await buildTransformedTeamFromDoc(updatedTeam);
};

export const manageTeamStaffService = async (teamId, memberId, action) => {
  if (!['promote', 'demote'].includes(action)) {
    throw new CustomError("Invalid action. Must be 'promote' or 'demote'.", 400);
  }

  const result = await withOptionalTransaction(async (session) => {
    const teamQuery = Team.findOne({ _id: teamId, isDeleted: false });
    if (session) teamQuery.session(session);
    const team = await teamQuery;
    if (!team) throw new CustomError("Team not found", 404);

    // Verify member exists in team
    const memberIndex = team.teamMembers.findIndex(
      (m) => m.user.toString() === memberId.toString()
    );

    if (memberIndex === -1) {
      throw new CustomError("The specified user is not a member of the team.", 404);
    }

    // Prevent modifying the Owner (Captain)
    if (team.captain.toString() === memberId.toString()) {
      throw new CustomError("Cannot separate system role for the Team Owner.", 403);
    }

    const userQuery = User.findById(memberId);
    if (session) userQuery.session(session);
    const user = await userQuery;
    if (!user) throw new CustomError("User not found", 404);

    if (action === "promote") {
      // Check if already manager
      const alreadyManager = user.roles.some(
        r => r.scope === Scopes.TEAM &&
          r.scopeId.toString() === team._id.toString() &&
          r.role === Roles.TEAM.MANAGER
      );

      if (alreadyManager) {
        return { earlyReturn: true, message: "Member is already a Manager.", teamId: team._id, team };
      }

      // Add Manager Role to User
      const updateQuery = User.updateOne(
        { _id: memberId, "roles.scopeId": team._id },
        { $set: { "roles.$.role": Roles.TEAM.MANAGER } }
      );
      if (session) updateQuery.session(session);
      await updateQuery;

    } else if (action === "demote") {
      // Remove Manager Role
      const updateQuery = User.updateOne(
        { _id: memberId, "roles.scopeId": team._id },
        { $set: { "roles.$.role": Roles.TEAM.PLAYER } }
      );
      if (session) updateQuery.session(session);
      await updateQuery;
    }

    return { earlyReturn: false, teamId: team._id, team };
  });

  if (result.earlyReturn) {
    return { message: result.message, team: await buildTransformedTeamFromDoc(result.team) };
  }

  // Invalidate Redis cache (with retry logic)
  await invalidateCacheWithRetry([`user_profile:${memberId}`, `team_details:${teamId}`]);

  return { message: `Member successfully ${action === "promote" ? "promoted to Manager" : "demoted to Player"}.`, team: await buildTransformedTeamFromDoc(result.team) };
};

export const manageMemberRoleService = async (teamId, memberId, role) => {
  const teamId_saved = teamId;
  const savedTeam = await withOptionalTransaction(async (session) => {
    const teamQuery = Team.findOne({ _id: teamId, isDeleted: false });
    if (session) teamQuery.session(session);
    const team = await teamQuery;
    if (!team) throw new CustomError("Team not found", 404);

    const member = team.teamMembers.find(
      (m) => m.user.toString() === memberId.toString()
    );

    if (!member) {
      throw new CustomError("The specified user is not a member of the team.", 404);
    }

    // Backfill missing denormalized fields if any
    const memberUserIds = team.teamMembers.map(m => m.user);
    const usersQuery = User.find({ _id: { $in: memberUserIds } }).select("username avatar");
    if (session) usersQuery.session(session);
    const users = await usersQuery;

    team.teamMembers.forEach(m => {
      const user = users.find(u => u._id.toString() === m.user.toString());
      if (user) {
        if (!m.username) m.username = user.username;
        if (!m.avatar) m.avatar = user.avatar;
      }
    });

    const VALID_ROLES = ["igl", "rusher", "sniper", "support", "player", "coach", "analyst", "substitute"];
    if (!VALID_ROLES.includes(role)) {
      throw new CustomError("Invalid role specified.", 400);
    }

    member.roleInTeam = role;
    await team.save({ session });
    return team;
  });

  // Update Cache (with retry logic)
  await invalidateCacheWithRetry([`team_details:${teamId_saved}`, `user_profile:${memberId}`]);

  return { message: `The member's role has been updated to '${role}'.`, team: await buildTransformedTeamFromDoc(savedTeam) };
};

// --- Existing Helpers & Services ---

export const findTeamById = async (id) => {
  const team = await Team.findOne({ _id: id, isDeleted: false });
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
 * @param {string} teamId
 * @param {Object} session - Optional MongoDB session
 */
export const getTransformedTeam = async (teamId, session = null) => {
  const query = Team.findOne({ _id: teamId, isDeleted: false }).select("-__v").lean();
  if (session) query.session(session);
  const team = await query;

  if (!team) return null;

  return await buildTransformedTeamFromDoc(team, session);
};

/**
 * Build a transformed team response from an already-loaded team document.
 * Reduces 3 DB queries to 1 (just JoinRequest.countDocuments + User.find).
 * Used after mutations where the team doc is already in memory.
 * @param {Object} teamDoc - A team document (Mongoose doc or plain object)
 * @param {Object} session - Optional MongoDB session
 */
export const buildTransformedTeamFromDoc = async (teamDoc, session = null) => {
  const team = teamDoc.toObject ? teamDoc.toObject() : teamDoc;
  const teamId = team._id;

  // Run the two remaining queries in parallel (instead of sequentially)
  const userIds = team.teamMembers.map((m) => m.user);

  const pendingRequestsQuery = JoinRequest.countDocuments({ target: teamId, status: "pending" });
  if (session) pendingRequestsQuery.session(session);

  const usersQuery = User.find({ _id: { $in: userIds } }).select("roles _id username avatar").lean();
  if (session) usersQuery.session(session);

  const [pendingRequestsCount, users] = await Promise.all([
    pendingRequestsQuery,
    usersQuery,
  ]);

  // Strip __v if present
  const { __v, ...teamData } = team;

  return {
    ...teamData,
    pendingRequestsCount,
    teamMembers: team.teamMembers.map((m) => {
      const memberData = m.toObject ? m.toObject() : m;
      const userObj = users.find((u) => u._id.toString() === memberData.user.toString());
      return {
        ...memberData,
        username: memberData.username || userObj?.username || "Unknown",
        avatar: memberData.avatar || userObj?.avatar || "",
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
  // If a session is passed from a parent transaction, use it directly
  if (session) {
    return await _addMemberToTeamOps({ teamId, userId, roleInTeam, session });
  }

  // Otherwise, wrap in optional transaction
  await withOptionalTransaction(async (session) => {
    await _addMemberToTeamOps({ teamId, userId, roleInTeam, session });
  });

  // Cache Invalidation (always runs, post-commit/standalone)
  if (!session) {
    await invalidateCacheWithRetry([`user_profile:${userId}`, `team_details:${teamId}`]);
  }

  return true;
};

/** Internal helper for addMemberToTeam operations */
const _addMemberToTeamOps = async ({ teamId, userId, roleInTeam, session }) => {
  const userQuery = User.findById(userId);
  if (session) userQuery.session(session);
  const user = await userQuery;
  if (!user) throw new CustomError("User not found", 404);
  if (user.teamId) throw new CustomError(`${user.username} is already in a team`, 400);

  // Atomic Update: Checks if team exists AND has fewer than 20 members
  const updatedTeam = await Team.findOneAndUpdate(
    {
      _id: teamId,
      isDeleted: false,
      "teamMembers.19": { $exists: false }
    },
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
    { session, new: true }
  );

  if (!updatedTeam) {
    const existsQuery = Team.exists({ _id: teamId, isDeleted: false });
    if (session) existsQuery.session(session);
    const teamExists = await existsQuery;
    if (!teamExists) throw new CustomError("Team not found", 404);
    throw new CustomError("Team limit exceeded. Max 20 members allowed.", 400);
  }

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

  return true;
};

/**
 * Service to batch add members to a team
 */
export const batchAddMembersToTeam = async ({ teamId, memberIds, session = null }) => {
  // If a session is passed from a parent transaction, use it directly
  if (session) {
    return await _batchAddMembersOps({ teamId, memberIds, session });
  }

  // Otherwise, wrap in optional transaction
  await withOptionalTransaction(async (session) => {
    await _batchAddMembersOps({ teamId, memberIds, session });
  });

  // Cache Invalidation (always runs, post-commit/standalone)
  if (!session) {
    const keys = memberIds.map((mid) => `user_profile:${mid}`);
    keys.push(`team_details:${teamId}`);
    await invalidateCacheWithRetry(keys);
  }

  return true;
};

/** Internal helper for batchAddMembersToTeam operations */
const _batchAddMembersOps = async ({ teamId, memberIds, session }) => {
  const teamQuery = Team.findOne({ _id: teamId, isDeleted: false });
  if (session) teamQuery.session(session);
  const team = await teamQuery;
  if (!team) throw new CustomError("Team not found", 404);

  const usersQuery = User.find({ _id: { $in: memberIds } });
  if (session) usersQuery.session(session);
  const users = await usersQuery;
  if (users.length !== memberIds.length) throw new CustomError("One or more users not found", 404);

  const bulkOps = [];
  const teamUpdateOps = [];

  for (const user of users) {
    if (user.teamId) throw new CustomError(`${user.username} is already in a team`, 400);

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

    teamUpdateOps.push({
      user: user._id,
      username: user.username,
      avatar: user.avatar,
      roleInTeam: "player",
    });
  }

  if (bulkOps.length > 0) {
    await User.bulkWrite(bulkOps, { session });

    const updatedTeam = await Team.findOneAndUpdate(
      {
        _id: teamId,
        __v: team.__v,
        $expr: {
          $lte: [
            { $add: [{ $size: "$teamMembers" }, teamUpdateOps.length] },
            20
          ]
        }
      },
      {
        $push: { teamMembers: { $each: teamUpdateOps } },
        $inc: { __v: 1 }
      },
      { session, new: true }
    );

    if (!updatedTeam) {
      const freshQuery = Team.findById(teamId);
      if (session) freshQuery.session(session);
      const freshTeam = await freshQuery;
      if (freshTeam && freshTeam.teamMembers.length + teamUpdateOps.length > 20) {
        throw new CustomError(
          `Cannot add ${memberIds.length} member(s). Team currently has ${freshTeam.teamMembers.length} members. Maximum limit is 20 members.`,
          400,
          "TEAM_LIMIT_EXCEEDED"
        );
      }
      throw new CustomError(
        "Team roster is being updated by another manager. Please refresh and try again.",
        409,
        "CONCURRENT_MODIFICATION"
      );
    }
  }
};

/**
 * Sync team rosters when a user updates their profile (Scalability Hook)
 * Now uses retry logic for reliability (addresses Data Consistency risk)
 */
export const syncUserInTeams = async (userId, { username, avatar }) => {
  return await syncUserInTeamsWithRetry(userId, { username, avatar });
};

/**
 * Service to remove a member from a team
 */
export const removeMemberFromTeam = async ({ teamId, userId, session = null }) => {
  const team = await Team.findOne({ _id: teamId, isDeleted: false }).session(session);
  if (!team) throw new CustomError("Team not found", 404);

  // Check if trying to remove captain
  if (team.captain.toString() === userId.toString()) {
    throw new CustomError("Cannot remove the Team Captain. Transfer ownership first.", 403);
  }

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

  // 3. Cache Invalidation (with retry logic)
  if (!session) {
    await invalidateCacheWithRetry([`user_profile:${userId}`, `team_details:${teamId}`]);
    // Invalidate socket membership cache so next join:team re-checks DB
    redis.del(`socket_member:${userId}:${teamId}`)
      .catch(err => logger.error(`Failed to invalidate socket membership cache:`, err.message));
  }

  return true;
};
