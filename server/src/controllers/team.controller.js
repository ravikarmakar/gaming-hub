import fs from "fs";
import mongoose from "mongoose";

import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { findUserById } from "../services/user.service.js";
import { Roles, Scopes } from "../constants/roles.js";
import { checkTeamNameUnique, getTransformedTeam, batchAddMembersToTeam, removeMemberFromTeam } from "../services/team.service.js";
import { uploadOnImageKit, deleteFromImageKit } from "../services/imagekit.service.js";
import { createNotification } from "./notification.controller.js";
import JoinRequest from "../models/join-request.model.js";
import { redis } from "../config/redis.js";


export const createTeam = TryCatchHandler(async (req, res, next) => {
  const { teamName, bio, tag, region } = req.body;
  const { userId } = req.user;

  try {
    await checkTeamNameUnique(teamName);

    const user = await findUserById(userId);
    if (user.teamId) throw new CustomError("You are already in a team", 400);
    if (!user.isAccountVerified)
      throw new CustomError("Account is not verified yet", 401);

    // 1. Image handling
    let imageUrl;
    let imageFileId = null;
    if (req.file) {
      const uploadRes = await uploadOnImageKit(
        req.file.path,
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

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: newTeam,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

export const updateTeam = TryCatchHandler(async (req, res, next) => {
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
  } = req.body;

  const team = req.teamDoc;

  // Check unique team name if it's being changed
  if (teamName && teamName !== team.teamName) {
    await checkTeamNameUnique(teamName);
    team.teamName = teamName;
  }

  // Handle branding assets update (logo and banner) - PARALLEL UPLOAD
  if (req.files) {
    const uploadPromises = [];

    if (req.files.image && req.files.image[0]) {
      uploadPromises.push(
        (async () => {
          const uploadRes = await uploadOnImageKit(
            req.files.image[0].path,
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

    if (req.files.banner && req.files.banner[0]) {
      uploadPromises.push(
        (async () => {
          const uploadRes = await uploadOnImageKit(
            req.files.banner[0].path,
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
      console.error("Redis parse error team details:", err);
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
  console.log("REMOVE MEMBER REQUEST:", req.params.id);
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

  // 3. Invalidate Redis cache for both users
  const pipeline = redis.pipeline();
  pipeline.del(`user_profile:${userId}`);     // Captain (updated team view)
  pipeline.del(`user_profile:${memberId}`);   // Removed Member (no team view)
  await pipeline.exec();

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

  console.log("REMOVE MEMBER SUCCESS, Sending response.");

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
    console.error("Notification failed:", notifErr);
    // Continue anyway
  }

  res.status(200).json({
    success: true,
    message: "You have successfully left the team.",
  });
});

export const transferTeamOwnerShip = TryCatchHandler(async (req, res, next) => {
  const { memberId } = req.body;

  const team = req.teamDoc; // current team (from authorize middleware)
  const user = req.user; // old owner (from isAuthenticated/isVerified)

  // 1 Check: member team ka hissa hai ya nahi
  const isMember = team.teamMembers.some(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!isMember) {
    throw new CustomError("The selected member is not part of your team.", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2 Update Team document (captain + teamMembers)
    const updatedMembers = team.teamMembers.map((member) => {
      const uid = member.user.toString();

      if (uid === memberId.toString()) {
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
          captain: memberId,
          teamMembers: updatedMembers,
        },
      }
    );

    // 3. Update User document (roles)
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
      }
    );

    // 4. Update New Captain document (roles)
    const newCaptainUser = await findUserById(memberId);

    await User.findByIdAndUpdate(
      memberId,
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
      }
    );

    // 5. Clear Redis cache
    const pipeline = redis.pipeline();
    pipeline.del(`user_profile:${user._id}`);
    pipeline.del(`user_profile:${memberId}`);
    await pipeline.exec();

    // 6. Fetch updated team using helper
    const transformedTeam = await getTransformedTeam(team._id);

    // 7. Response
    res.status(200).json({
      success: true,
      message: "Team ownership transferred successfully.",
      data: transformedTeam,
    });
  } catch (error) {
    next(error);
  }
});

export const manageMemberRole = TryCatchHandler(async (req, res, next) => {
  const { memberId, role } = req.body;

  // if (role === "igl")
  //   throw new CustomError("You cannot assign the 'igl' role manually.", 400);

  const team = req.teamDoc;

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

  // Fetch updated team roster using helper
  const transformedTeam = await getTransformedTeam(team._id);

  res.status(200).json({
    success: true,
    message: `The member's role has been updated to '${role}'.`,
    data: transformedTeam,
  });
});

export const deleteTeam = TryCatchHandler(async (req, res, next) => {
  const team = req.teamDoc;

  try {
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
      console.error(`Failed to cleanup join requests for team ${team._id}:`, err)
    );

    // 5. Cleanup images from ImageKit to save costs
    if (team.imageFileId) {
      deleteFromImageKit(team.imageFileId);
    }
    if (team.bannerFileId) {
      deleteFromImageKit(team.bannerFileId);
    }

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const manageStaffRole = TryCatchHandler(async (req, res, next) => {
  const { memberId, action } = req.body; // action: "promote" | "demote"



  const team = req.teamDoc;

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

  const user = await findUserById(memberId);

  if (action === "promote") {
    // Check if already manager
    const alreadyManager = user.roles.some(
      r => r.scope === Scopes.TEAM &&
        r.scopeId.toString() === team._id.toString() &&
        r.role === Roles.TEAM.MANAGER
    );

    if (alreadyManager) {
      return res.status(200).json({ success: true, message: "Member is already a Manager." });
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

    // Remove Manager Role
    await User.updateOne(
      { _id: memberId, "roles.scopeId": team._id },
      { $set: { "roles.$.role": Roles.TEAM.PLAYER } }
    );

  }

  // Invalidate Redis cache
  await redis.del(`user_profile:${memberId}`);

  // Fetch updated team roster using helper
  const transformedTeam = await getTransformedTeam(team._id);

  res.status(200).json({
    success: true,
    message: `Member successfully ${action === "promote" ? "promoted to Manager" : "demoted to Player"}.`,
    data: transformedTeam
  });
});