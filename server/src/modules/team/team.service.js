import fs from "fs";
import Team from "./team.model.js";
import * as UserGateway from "../user/user.gateway.js";
import JoinRequest from "../join-request/join-request.model.js";
import teamEvents, { TEAM_EVENT_TYPES } from "./team.events.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { redis } from "../../shared/config/redis.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { logger } from "../../shared/utils/logger.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { invalidateCacheWithRetry } from "../../shared/utils/cache.js";
import { VALID_TEAM_MEMBER_ROLES, UNIQUE_ROLES } from "./team.constants.js";

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

export const createTeamService = async (userId, body, file) => {
  const { teamName, bio, tag, region } = body;

  // 0. Pre-validation (Parallelize DB checks to reduce RTT)
  const [userPreCheck] = await Promise.all([
    UserGateway.getUserById(userId),
    checkTeamNameUnique(teamName) // throws CustomError(409) if duplicate
  ]);
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
      const user = await UserGateway.getUserWithRoles(userId, session);
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
      await UserGateway.assignTeamToUser(userId, newTeam._id, Roles.TEAM.OWNER, session);

      return newTeam;
    });

    // 4. Invalidate user profile cache
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

    // Invalidate Team Cache
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

    // Clean up local files on success path
    if (files) {
      if (files.image && files.image[0] && fs.existsSync(files.image[0].path)) {
        try { fs.unlinkSync(files.image[0].path); } catch (e) { logger.error("Failed to delete local file:", e); }
      }
      if (files.banner && files.banner[0] && fs.existsSync(files.banner[0].path)) {
        try { fs.unlinkSync(files.banner[0].path); } catch (e) { logger.error("Failed to delete local file:", e); }
      }
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

  // 1. Set teamId = null and remove team roles for all team members
  const memberIds = team.teamMembers.map((member) => member.user);
  await UserGateway.bulkRemoveTeamFromUsers(memberIds, team._id);

  // 2. Soft delete the team
  await Team.findByIdAndUpdate(team._id, {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });

  // 3. Invalidate Redis cache for all members
  const pipeline = redis.pipeline();
  memberIds.forEach((userId) => {
    pipeline.del(`user_profile:${userId}`);
  });
  // Also invalidate team details and socket memberships
  pipeline.del(`team_details:${teamId}`);
  memberIds.forEach((userId) => {
    pipeline.del(`socket_member:${userId}:${teamId}`);
  });
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

  // 6. Emit event for real-time UI refresh
  teamEvents.emit(TEAM_EVENT_TYPES.TEAM_DELETED, {
    teamId: team._id,
    memberIds
  });

  return true;
};

export const transferTeamOwnershipService = async (teamId, currentOwnerId, newOwnerId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new CustomError("Team not found", 404);

  // Verify current owner
  if (team.captain.toString() !== currentOwnerId.toString()) {
    throw new CustomError("You are not the captain of this team", 403);
  }

  // Check: member team ka hissa hai ya nahi
  const isMember = team.teamMembers.some(
    (m) => m.user.toString() === newOwnerId.toString()
  );

  if (!isMember) {
    throw new CustomError("The selected member is not part of your team.", 400);
  }

  const updatedTeam = await withOptionalTransaction(async (session) => {
    const user = await UserGateway.getUserWithRoles(currentOwnerId, session); // Old owner

    // Update Team document (captain + teamMembers)
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
    await UserGateway.updateMemberSystemRole(user._id, team._id, Roles.TEAM.PLAYER, session);

    // 4. Update New Captain document (roles)
    // We remove and then push to ensure clean state (as per original logic although updateMemberSystemRole might be enough if target exists)
    // To match original logic precisely:
    await UserGateway.removeTeamFromUser(newOwnerId, team._id, session);
    await UserGateway.assignTeamToUser(newOwnerId, team._id, Roles.TEAM.OWNER, session);

    return updatedTeam;
  });

  // 5. Clear Redis cache
  const pipeline = redis.pipeline();
  pipeline.del(`user_profile:${currentOwnerId}`);
  pipeline.del(`user_profile:${newOwnerId}`);
  pipeline.del(`team_details:${teamId}`);
  await pipeline.exec();

  // 6. Emit event for side effects (notifications)
  teamEvents.emit(TEAM_EVENT_TYPES.OWNER_TRANSFERRED, {
    team,
    newOwnerId,
    oldOwnerId: currentOwnerId
  });

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

    const user = await UserGateway.getUserWithRoles(memberId, session);
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
      await UserGateway.updateMemberSystemRole(memberId, team._id, Roles.TEAM.MANAGER, session);

    } else if (action === "demote") {
      // Remove Manager Role
      await UserGateway.updateMemberSystemRole(memberId, team._id, Roles.TEAM.PLAYER, session);
    }

    return { earlyReturn: false, teamId: team._id, team };
  });

  if (result.earlyReturn) {
    return { message: result.message, team: await buildTransformedTeamFromDoc(result.team) };
  }

  // Invalidate Redis cache
  await invalidateCacheWithRetry([`user_profile:${memberId}`, `team_details:${teamId}`]);

  // Emit profile update to the affected user
  try {
    const { emitProfileUpdate } = await import("../user/user.socket.js");
    emitProfileUpdate(memberId, { teamId, action: "role_changed" });
  } catch (err) {
    logger.warn("Failed to emit profile update for member role change:", err.message);
  }

  // Emit event for side effects (notifications)
  const newRole = action === "promote" ? "manager" : "player";
  teamEvents.emit(TEAM_EVENT_TYPES.ROLE_UPDATED, { team: result.team, memberId, newRole });

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
    const users = await UserGateway.findUsersByIds(memberUserIds, "username avatar", session);

    team.teamMembers.forEach(m => {
      const user = users.find(u => u._id.toString() === m.user.toString());
      if (user) {
        if (!m.username) m.username = user.username;
        if (!m.avatar) m.avatar = user.avatar;
      }
    });

    if (!VALID_TEAM_MEMBER_ROLES.includes(role)) {
      throw new CustomError("Invalid role specified.", 400);
    }

    // Role Uniqueness Check
    if (UNIQUE_ROLES.includes(role)) {
      const alreadyExists = team.teamMembers.some(
        (m) => m.roleInTeam === role && m.user.toString() !== memberId.toString()
      );
      if (alreadyExists) {
        throw new CustomError(`The role '${role.toUpperCase()}' is already assigned to another member. Each team can have only one member in this role.`, 400);
      }
    }

    // Role Limit Check
    if (role === "substitute") {
      const substituteCount = team.teamMembers.filter(
        (m) => m.roleInTeam === "substitute" && m.user.toString() !== memberId.toString()
      ).length;
      if (substituteCount >= 2) {
        throw new CustomError("A team can have a maximum of 2 substitutes.", 400);
      }
    }

    member.roleInTeam = role;
    await team.save({ session });
    return team;
  });

  // Update Cache
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

  const users = await UserGateway.findUsersByIds(userIds, "roles _id username avatar", session);

  const pendingRequestsCount = await pendingRequestsQuery;

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

    // Emit profile update to the joining user
    try {
      const { emitProfileUpdate } = await import("../user/user.socket.js");
      emitProfileUpdate(userId, { teamId, action: "joined" });
    } catch (err) {
      logger.warn("Failed to emit profile update for new member:", err.message);
    }
  }

  return true;
};

/** Internal helper for addMemberToTeam operations */
const _addMemberToTeamOps = async ({ teamId, userId, roleInTeam, session }) => {
  const user = await UserGateway.getUserById(userId, session);
  if (!user) throw new CustomError("User not found", 404);
  if (user.teamId) throw new CustomError(`${user.username} is already in a team`, 400);

  const query = {
    _id: teamId,
    isDeleted: false,
    "teamMembers.11": { $exists: false }
  };

  if (UNIQUE_ROLES.includes(roleInTeam)) {
    query["teamMembers.roleInTeam"] = { $ne: roleInTeam };
  }

  if (roleInTeam === "substitute") {
    // This is a bit tricky for atomic update with $ne as we need count. 
    // We'll perform a pre-check since this is a relatively low-concurrency event compared to joins.
    // However, to stay atomic, we can count the substitutes in the query if we was using aggregation, 
    // but findOneAndUpdate limited. We'll use the pre-check + post-check pattern like team limit.
  }

  // Atomic Update: Checks if team exists, has capacity, and role is unique (if required)
  const updatedTeam = await Team.findOneAndUpdate(
    query,
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
    const freshQuery = Team.findOne({ _id: teamId, isDeleted: false });
    if (session) freshQuery.session(session);
    const freshTeam = await freshQuery;

    if (!freshTeam) throw new CustomError("Team not found", 404);
    if (freshTeam.teamMembers.length >= 12) {
      throw new CustomError("Team limit exceeded. Max 12 members allowed.", 400);
    }
    if (UNIQUE_ROLES.includes(roleInTeam) && freshTeam.teamMembers.some(m => m.roleInTeam === roleInTeam)) {
      throw new CustomError(`The role '${roleInTeam.toUpperCase()}' is already assigned to another member.`, 400);
    }
    // If we reach here, it's likely a race condition where the team was updated 
    // between our query and findOneAndUpdate, but none of the specific checks matched.
    throw new CustomError("Could not join team: Team state changed or role no longer available. Please try again.", 409);
  }

  // Post-check for substitute limit if roleInTeam is substitute
  if (roleInTeam === "substitute") {
    // Re-fetch within session to get latest count
    const freshTeamForCheck = await Team.findById(teamId).session(session);
    const substituteCount = freshTeamForCheck.teamMembers.filter(m => m.roleInTeam === "substitute").length;
    if (substituteCount > 2) {
      throw new CustomError("A team can have a maximum of 2 substitutes.", 400);
    }
  }

  // Atomic User Update: Ensures user isn't already in another team (race condition guard)
  const updatedUser = await UserGateway.assignTeamToUser(userId, teamId, Roles.TEAM.PLAYER, session);

  if (!updatedUser) {
    // Rollback Team update (if we are in a session, this throws. If not, we have a mismatch)
    throw new CustomError(`User ${user.username} successfully assigned to a team concurrently. Join failed.`, 409);
  }

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

    // Emit profile updates to all batch-added users
    try {
      const { emitProfileUpdate } = await import("../user/user.socket.js");
      memberIds.forEach((mid) => emitProfileUpdate(mid, { teamId, action: "joined" }));
    } catch (err) {
      logger.warn("Failed to emit profile updates for batch added members:", err.message);
    }
  }

  return true;
};

/** Internal helper for batchAddMembersToTeam operations */
const _batchAddMembersOps = async ({ teamId, memberIds, session }) => {
  const teamQuery = Team.findOne({ _id: teamId, isDeleted: false });
  if (session) teamQuery.session(session);
  const team = await teamQuery;
  if (!team) throw new CustomError("Team not found", 404);

  const users = await UserGateway.findUsersByIds(memberIds, "", session);
  if (users.length !== memberIds.length) throw new CustomError("One or more users not found", 404);

  const bulkOps = [];
  const teamUpdateOps = [];

  for (const user of users) {
    if (user.teamId) throw new CustomError(`${user.username} is already in a team`, 400);

    bulkOps.push({
      updateOne: {
        filter: { _id: user._id, teamId: null },
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
    await UserGateway.bulkAssignTeamToUsers(memberIds, teamId, Roles.TEAM.PLAYER, session);

    const updatedTeam = await Team.findOneAndUpdate(
      {
        _id: teamId,
        __v: team.__v,
        $expr: {
          $lte: [
            { $add: [{ $size: "$teamMembers" }, teamUpdateOps.length] },
            12
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
      if (freshTeam && freshTeam.teamMembers.length + teamUpdateOps.length > 12) {
        throw new CustomError(
          `Cannot add ${memberIds.length} member(s). Team currently has ${freshTeam.teamMembers.length} members. Maximum limit is 12 members.`,
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

    // Verify all users were updated (check for race condition where user joined another team)
    const usersInUpdateCount = await UserGateway.countUsersInTeam(memberIds, teamId, session);
    if (usersInUpdateCount !== memberIds.length) {
      throw new CustomError("One or more users joined another team concurrently. Batch join aborted.", 409);
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
export const removeMemberFromTeam = async ({ teamId, userId, session = null, actorId = null, actorRole = null }) => {
  const team = await Team.findOne({ _id: teamId, isDeleted: false }).session(session);
  if (!team) throw new CustomError("Team not found", 404);

  // Check if trying to remove captain
  if (team.captain.toString() === userId.toString()) {
    throw new CustomError("Cannot remove the Team Captain. Transfer ownership first.", 403);
  }

  // Capture member info before removal for event emission
  const memberObj = team.teamMembers.find(m => m.user.toString() === userId.toString());
  const memberName = memberObj?.username || "Unknown";

  // 1. Remove from Team Roster
  await Team.findByIdAndUpdate(
    teamId,
    { $pull: { teamMembers: { user: userId } } },
    { session }
  );

  // 2. Clear User Team Data & Roles
  await UserGateway.removeTeamFromUser(userId, teamId, session);

  // 3. Cache Invalidation (with retry logic)
  if (!session) {
    await invalidateCacheWithRetry([`user_profile:${userId}`, `team_details:${teamId}`]);

    // Emit profile update to the removed user
    try {
      const { emitProfileUpdate } = await import("../user/user.socket.js");
      emitProfileUpdate(userId, { teamId, action: "left" });
    } catch (err) {
      logger.warn("Failed to emit profile update for removed member:", err.message);
    }

    // Invalidate socket membership cache so next join:team re-checks DB
    try {
      if (typeof redis.del === "function") {
        await redis.del(`socket_member:${userId}:${teamId}`);
      }
    } catch (err) {
      logger.error(`Failed to invalidate socket membership cache:`, err.message);
    }

    // 4. Emit event for side effects (notifications)
    if (actorId && actorId.toString() !== userId.toString()) {
      // It was a kick
      teamEvents.emit(TEAM_EVENT_TYPES.MEMBER_KICKED, {
        team,
        memberId: userId,
        actorId,
        actorRole: actorRole || "manager"
      });
    } else {
      // It was a self-leave
      teamEvents.emit(TEAM_EVENT_TYPES.MEMBER_LEFT, {
        team,
        memberId: userId,
        memberName
      });
    }
  }

  return true;
};

/**
 * Strategy methods for Join Requests and Invitations
 */

export const validateJoinRequest = async (userId, teamId, session = null) => {
  const user = await UserGateway.getUserById(userId, session);
  if (!user) throw new CustomError("User not found", 404);

  if (user.teamId) throw new CustomError("You are already in a team", 400);

  const q = Team.findById(teamId);
  if (session) q.session(session);
  const resource = await q;

  if (!resource || resource.isDeleted) throw new CustomError("Team not found", 404);
  if (!resource.isRecruiting) throw new CustomError("This team is not currently recruiting", 400);

  return { resource, recipientId: resource.captain };
};

export const acceptJoinRequest = async (requesterId, teamId, handledBy, session = null) => {
  const requester = await UserGateway.getUserById(requesterId, session);
  if (!requester) throw new CustomError("Requester not found", 404);

  const teamQuery = Team.findById(teamId);
  if (session) teamQuery.session(session);
  const team = await teamQuery;

  if (!team || team.isDeleted || !team.isRecruiting) {
    throw new CustomError("This team is no longer recruiting", 400);
  }

  if (requester.teamId) {
    throw new CustomError("Requester has already joined another team", 400);
  }

  await addMemberToTeam({
    teamId,
    userId: requesterId,
    roleInTeam: "player",
    session,
  });

  teamEvents.emit(TEAM_EVENT_TYPES.MEMBER_JOINED, {
    team,
    memberId: requesterId,
    actorId: handledBy
  });

  const responseData = await getTransformedTeam(teamId, session);

  const socketEventData = {
    teamId,
    memberData: {
      userId: requesterId,
      username: requester.username,
      avatar: requester.avatar,
      roleInTeam: "player",
    }
  };

  return {
    responseData,
    socketEventData,
    requesterId,
    teamId,
    cacheKeys: [`user_profile:${requesterId}`, `team_details:${teamId}`]
  };
};

export const validateInvitation = async (senderId, inviteeId, teamId) => {
  const target = await Team.findById(teamId);
  if (!target || target.isDeleted) throw new CustomError("Team not found", 404);

  const senderUser = await UserGateway.getUserById(senderId);
  const senderRole = senderUser?.roles?.find(
    (r) => r.scope === Scopes.TEAM && r.scopeId?.toString() === teamId.toString()
  )?.role;

  const isAuthorized =
    target.captain?.toString() === senderId.toString() ||
    senderRole === Roles.TEAM.MANAGER;

  if (!isAuthorized) {
    throw new CustomError("You do not have permission to invite members to this team", 403);
  }

  const invitee = await UserGateway.getUserById(inviteeId);
  if (!invitee) throw new CustomError("User not found to invite", 404);

  if (invitee.teamId?.toString() === teamId.toString()) {
    throw new CustomError("User is already a member of this team", 400);
  }

  return { resource: target, invitee };
};

export const acceptInvitation = async (inviteeId, teamId, role, session = null) => {
  const user = await UserGateway.getUserById(inviteeId, session);
  if (!user) throw new CustomError("User not found", 404);

  const teamQuery = Team.findById(teamId);
  if (session) teamQuery.session(session);
  const team = await teamQuery;
  if (!team || team.isDeleted) throw new CustomError("Team not found or deleted", 404);

  if (user.teamId) throw new CustomError("You are already in a team", 400);

  // Check Member Limit (Max 12)
  if (team.teamMembers.length >= 12) throw new CustomError("Team has reached its member limit (12).", 400);

  // Standardize roleInTeam
  const roleInTeam = role === Roles.TEAM.MANAGER ? "manager" : "player";

  // Use the atomic addMemberToTeam service to eliminate race conditions
  await addMemberToTeam({
    teamId,
    userId: inviteeId,
    roleInTeam,
    session,
  });

  return {
    resultMessage: `You have successfully joined ${team.teamName}`,
    cacheKeys: [`user_profile:${inviteeId}`, `team_details:${teamId}`],
    socketData: {
      teamId,
      memberData: {
        userId: inviteeId,
        username: user.username,
        avatar: user.avatar,
        roleInTeam: roleInTeam
      }
    }
  };
};

