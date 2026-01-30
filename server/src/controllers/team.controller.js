import fs from "fs";
import mongoose from "mongoose";

import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { findUserById } from "../services/user.service.js";
import { Roles, Scopes } from "../constants/roles.js";
import { checkTeamNameUnique } from "../services/team.service.js";
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
    if (!user.isAccountVerified) throw new CustomError("Account is not verified yet", 401);

    // 1. Image handling with ImageKit
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
      teamMembers: [{ user: user._id, roleInTeam: "igl" }],
    };

    // 2. Create Team (Atomic)
    const newTeam = new Team(teamData);
    await newTeam.save();

    // 3. Update User (Atomic)
    await User.findByIdAndUpdate(userId, {
      $set: { teamId: newTeam._id },
      $push: {
        roles: {
          scope: Scopes.TEAM,
          role: Roles.TEAM.OWNER,
          scopeId: newTeam._id,
          scopeModel: "Team",
        },
      },
    });

    // 4. Invalidate user profile cache so checkAuth gets fresh data
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

  // Handle branding assets update (logo and banner)
  if (req.files) {
    if (req.files.image && req.files.image[0]) {
      const uploadRes = await uploadOnImageKit(
        req.files.image[0].path,
        `team-logo-${team._id}-${Date.now()}`,
        "/teams/logos"
      );
      if (uploadRes) {
        // Delete old logo if it exists
        if (team.imageFileId) {
          await deleteFromImageKit(team.imageFileId);
        }
        team.imageUrl = uploadRes.url;
        team.imageFileId = uploadRes.fileId;
      }
    }

    if (req.files.banner && req.files.banner[0]) {
      const uploadRes = await uploadOnImageKit(
        req.files.banner[0].path,
        `team-banner-${team._id}-${Date.now()}`,
        "/teams/banners"
      );
      if (uploadRes) {
        // Delete old banner if it exists
        if (team.bannerFileId) {
          await deleteFromImageKit(team.bannerFileId);
        }
        team.bannerUrl = uploadRes.url;
        team.bannerFileId = uploadRes.fileId;
      }
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

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    data: team,
  });
});

export const fetchTeamDetails = TryCatchHandler(async (req, res, next) => {
  const { teamId } = req.params;

  // Validate ObjectId format early to prevent invalid queries
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return next(new CustomError("Invalid team ID format", 400));
  }

  const team = await Team.findOne({
    _id: teamId,
    isDeleted: false
  })
    .select('-__v') // Exclude version key
    .populate({
      path: 'teamMembers.user',
      select: 'username avatar roles _id esportsRole', // Include roles to display system team roles
    })
    .lean(); // Return plain JS object for better performance

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
      status: "pending"
    });
    hasPendingRequest = !!existingRequest;

    // If user is a member, fetch the count of ALL pending requests for the team
    const isMember = team.teamMembers.some(m => m.user._id.toString() === req.user._id.toString());
    if (isMember) {
      pendingRequestsCount = await JoinRequest.countDocuments({
        target: teamId,
        status: "pending"
      });
    }
  }

  // Transform populated data to match expected client format
  const transformedTeam = {
    ...team,
    teamMembers: team.teamMembers.map(member => ({
      user: member.user._id,
      roleInTeam: member.roleInTeam,
      username: member.user.username,
      avatar: member.user.avatar,
      systemRole: member.user.roles.find(role => role.scope === Scopes.TEAM)?.role || 'player',
      joinedAt: member.joinedAt,
      isActive: member.isActive,
    })),
    hasPendingRequest,
    pendingRequestsCount
  };

  res.status(200).json({
    success: true,
    message: "Team details fetched successfully",
    data: transformedTeam,
  });
});

export const fetchAllTeams = TryCatchHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", region, isRecruiting, isVerified } = req.query;
  const skip = (page - 1) * limit;

  // Build query filter
  const query = { isDeleted: false };
  if (search) {
    query.$or = [
      { teamName: { $regex: search, $options: "i" } },
      { tag: { $regex: search, $options: "i" } },
    ];
  }
  if (region) query.region = region;
  if (isRecruiting !== undefined) query.isRecruiting = isRecruiting === "true";
  if (isVerified !== undefined) query.isVerified = isVerified === "true";

  const aggregateQuery = [
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(skip) },
    { $limit: parseInt(limit) },
    // 1. Lookup teamMembers.user => users
    {
      $lookup: {
        from: "users",
        localField: "teamMembers.user",
        foreignField: "_id",
        as: "membersData",
      },
    },
    // 2. Lookup captain => users
    {
      $lookup: {
        from: "users",
        localField: "captain",
        foreignField: "_id",
        as: "captainData",
      },
    },
    // 3. Embed members data separately
    {
      $addFields: {
        teamMembers: {
          $map: {
            input: "$teamMembers",
            as: "member",
            in: {
              user: "$$member.user",
              roleInTeam: "$$member.roleInTeam",
              username: {
                $let: {
                  vars: {
                    userObj: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$membersData",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$member.user"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$userObj.username",
                },
              },
              avatar: {
                $let: {
                  vars: {
                    userObj: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$membersData",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$member.user"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$userObj.avatar",
                },
              },
            },
          },
        },
        captain: {
          $let: {
            vars: {
              c: { $arrayElemAt: ["$captainData", 0] },
            },
            in: {
              _id: "$$c._id",
              username: "$$c.username",
              avatar: "$$c.avatar",
            },
          },
        },
      },
    },
    // 4. Remove extra lookup arrays
    {
      $project: {
        membersData: 0,
        captainData: 0,
      },
    },
  ];

  const [teams, totalCount] = await Promise.all([
    Team.aggregate(aggregateQuery),
    Team.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    message: "Fetched all teams successfully",
    data: teams,
    pagination: {
      totalCount,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      hasMore: totalCount > skip + teams.length
    }
  });
});

export const addMembers = TryCatchHandler(async (req, res, next) => {
  const { members } = req.body;

  if (!Array.isArray(members) || members.length < 1)
    throw new CustomError("Please provide at least one team member.", 400);

  const team = req.teamDoc;

  // Fetch all users and check in one go
  const usersData = await Promise.all(members.map(findUserById));

  const issues = usersData.reduce(
    (acc, user) => {
      if (user.teamId) acc.withTeam.push(user.username);
      if (!user.isAccountVerified) acc.unverified.push(user.username);
      return acc;
    },
    { withTeam: [], unverified: [] }
  );

  if (issues.withTeam.length)
    throw new CustomError(
      `Users already belong to a team: ${issues.withTeam.join(", ")}`,
      400
    );

  if (issues.unverified.length)
    throw new CustomError(
      `Users have not verified their email: ${issues.unverified.join(", ")}`,
      400
    );

  // Check Team Limit
  const currentMembersCount = team.teamMembers.length;
  // Filter out members who are already in the team to get true addition count
  const newMembersCount = members.filter(mid =>
    !team.teamMembers.some(m => m.user.toString() === mid.toString())
  ).length;

  if (currentMembersCount + newMembersCount > 10) {
    throw new CustomError(`Cannot add more members. Team limit is 10. You have ${currentMembersCount} members.`, 400);
  }

  try {
    const updatedMembers = [...team.teamMembers];

    await Promise.all(
      members.map(async (memberId) => {
        const isAlreadyMember = team.teamMembers.some((m) => m.user.toString() === memberId.toString());

        if (!isAlreadyMember) {
          // 1. Update User (Atomic)
          await User.findByIdAndUpdate(memberId, {
            $set: { teamId: team._id },
            $push: {
              roles: {
                scope: Scopes.TEAM,
                role: Roles.TEAM.PLAYER,
                scopeId: team._id,
                scopeModel: "Team",
              },
            },
          });

          // 2. Prepare Roster update
          updatedMembers.push({ user: memberId, roleInTeam: "player" });
        }
      })
    );

    // 3. Update Team Roster (Atomic)
    await Team.findByIdAndUpdate(team._id, { $set: { teamMembers: updatedMembers } });

    res.status(200).json({
      success: true,
      message: "Members added successfully to the team.",
    });
  } catch (error) {
    next(error);
  }
});

export const removeMember = TryCatchHandler(async (req, res, next) => {
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

  // 1. Remove user from team roster
  await Team.findByIdAndUpdate(
    team._id,
    { $pull: { teamMembers: { user: memberId } } }
  );

  // 2. Clear user team data and roles
  await User.findByIdAndUpdate(
    memberId,
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

  // Fetch updated team roster
  const updatedTeam = await Team.findById(team._id).populate({
    path: "teamMembers.user",
    select: "username avatar _id",
  }).lean();

  const transformedTeam = {
    ...updatedTeam,
    teamMembers: updatedTeam.teamMembers.map((m) => ({
      user: m.user._id,
      roleInTeam: m.roleInTeam,
      username: m.user.username,
      avatar: m.user.avatar,
      joinedAt: m.joinedAt,
      isActive: m.isActive,
    })),
  };

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

  // 1. Atomic removal from team roster
  await Team.findByIdAndUpdate(
    team._id,
    { $pull: { teamMembers: { user: userId } } }
  );

  // 2. Atomic removal of team info from user
  await User.findByIdAndUpdate(
    userId,
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

  if (!memberId) {
    throw new CustomError(
      "Please provide a member ID to assign as captain.",
      400
    );
  }

  const team = req.teamDoc;   // current team
  const user = req.userDoc;   // old owner (request sender)

  // 1 Check: member team ka hissa hai ya nahi
  const isMember = team.teamMembers.some(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!isMember) {
    throw new CustomError(
      "The selected member is not part of your team.",
      400
    );
  }

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

    await Team.findByIdAndUpdate(team._id, {
      $set: {
        captain: memberId,
        teamMembers: updatedMembers,
      },
    });

    // 3 Update User document (roles)
    await User.findByIdAndUpdate(user._id, {
      $set: {
        roles: [
          // keep platform role safe
          ...user.roles.filter((r) => r.scope === "platform"),

          // ONLY current team as PLAYER
          {
            scope: "team",
            role: Roles.TEAM.PLAYER, // "team:player"
            scopeId: team._id,
            scopeModel: "Team",
          },
        ],
      },
    });

    // 4 Update New Captain document (roles)  
    const newCaptainUser = await findUserById(memberId);

    await User.findByIdAndUpdate(memberId, {
      $set: {
        roles: [
          ...newCaptainUser.roles.filter((r) => r.scope === "platform"),

          {
            scope: "team",
            role: Roles.TEAM.OWNER, // "team:owner"
            scopeId: team._id,
            scopeModel: "Team",
          },
        ],
      },
    });

    // 5 Clear Redis cache
    const pipeline = redis.pipeline();
    pipeline.del(`user_profile:${user._id}`);
    pipeline.del(`user_profile:${memberId}`);
    await pipeline.exec();

    // 6 Fetch updated team
    const updatedTeam = await Team.findOne({
      _id: team._id,
      isDeleted: false,
    })
      .select("-__v")
      .populate({
        path: "teamMembers.user",
        select: "username avatar _id",
      })
      .lean();

    const transformedTeam = {
      ...updatedTeam,
      teamMembers: updatedTeam.teamMembers.map((m) => ({
        user: m.user._id,
        roleInTeam: m.roleInTeam,
        username: m.user.username,
        avatar: m.user.avatar,
        joinedAt: m.joinedAt,
        isActive: m.isActive,
      })),
    };

    // 7 Response
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
  if (!memberId) throw new CustomError("Member ID is required.", 400);
  if (!role) throw new CustomError("Role is required.", 400);
  // if (role === "igl")
  //   throw new CustomError("You cannot assign the 'igl' role manually.", 400);

  const team = req.teamDoc;

  const member = team.teamMembers.find(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!member) {
    throw new CustomError("The specified user is not a member of the team.", 404);
  }

  member.roleInTeam = role;
  await team.save();

  // Invalidate Redis cache for the member (Stale roles/profile)
  await redis.del(`user_profile:${memberId}`);

  res.status(200).json({
    success: true,
    message: `The member's role has been updated to '${role}'.`,
    data: team,
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

  if (!memberId) throw new CustomError("Member ID is required.", 400);
  if (!["promote", "demote"].includes(action)) {
    throw new CustomError("Invalid action. Use 'promote' or 'demote'.", 400);
  }

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

  // Fetch updated team to return to client
  const updatedTeam = await Team.findOne({
    _id: team._id,
    isDeleted: false
  })
    .select('-__v')
    .populate({
      path: 'teamMembers.user',
      select: 'username avatar roles _id esportsRole',
    })
    .lean();

  const transformedTeam = {
    ...updatedTeam,
    teamMembers: updatedTeam.teamMembers.map(member => ({
      user: member.user._id,
      roleInTeam: member.roleInTeam,
      username: member.user.username,
      avatar: member.user.avatar,
      systemRole: member.user.roles.find(role => role.scope === Scopes.TEAM && role.scopeId.toString() === team._id.toString())?.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
    })),
  };

  res.status(200).json({
    success: true,
    message: `Member successfully ${action === "promote" ? "promoted to Manager" : "demoted to Player"}.`,
    data: transformedTeam
  });
});

// TODO: using socket.io emit real time events to users
// TODO: invalidate the user cache in redis when someting change in database
// TODO: ImageKit is not working; handle the team creation error later.