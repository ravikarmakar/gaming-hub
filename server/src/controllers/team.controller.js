import fs from "fs";
import mongoose from "mongoose";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { findUserById } from "../services/user.service.js";
import { Roles, Scopes } from "../config/roles.js";
import {
  checkTeamNameUnique,
  createNewTeam,
  findTeamById,
} from "../services/team.service.js";
import { uploadOnImageKit } from "../utils/imagekit.js";
import { createNotification } from "./notification.controller.js";

export const createTeam = TryCatchHandler(async (req, res, next) => {
  const { teamName, bio, tag, region } = req.body;
  const { userId } = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  const handleError = (message, status) => {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new CustomError(message, status));
  };

  try {
    await checkTeamNameUnique(teamName);

    const user = await findUserById(userId);
    if (user.teamId) throw new CustomError("You are already in a team", 400);
    if (!user.isAccountVerified) throw new CustomError("Account is not verified yet", 401);

    // image handling logic here
    let imageUrl = "https://cloudinary/dummy-image-url";
    if (req.file) {
      // Cleanup local file immediately since we are skipping upload for now
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const teamData = {
      teamName,
      tag,
      region,
      captain: user._id,
      imageUrl,
      bio,
      teamMembers: [{ user: user._id, roleInTeam: "igl" }],
    };

    const newTeam = new Team(teamData);
    await newTeam.save({ session });

    user.teamId = newTeam._id;
    user.roles.push({
      scope: Scopes.TEAM,
      role: Roles.TEAM.OWNER,
      scopeId: newTeam._id,
      scopeModel: "Team",
    });

    await user.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    await session.abortTransaction();
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  } finally {
    session.endSession();
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
    const cleanup = (filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };

    if (req.files.image && req.files.image[0]) {
      cleanup(req.files.image[0].path);
      team.imageUrl = "https://cloudinary/dummy-image-url/updated-logo"; // Placeholder
    }

    if (req.files.banner && req.files.banner[0]) {
      cleanup(req.files.banner[0].path);
      team.bannerUrl = "https://cloudinary/dummy-image-url/updated-banner"; // Placeholder
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
    team,
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
      select: 'username avatar _id', // Only select required fields for performance
    })
    .lean(); // Return plain JS object for better performance

  if (!team) {
    return next(new CustomError("Team not found", 404));
  }

  // Transform populated data to match expected client format
  const transformedTeam = {
    ...team,
    teamMembers: team.teamMembers.map(member => ({
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
    message: "Team details fetched successfully",
    team: transformedTeam,
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
    teams,
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Promise.all(
      members.map(async (memberId) => {
        if (
          !team.teamMembers.some((m) => m.user.toString() === memberId.toString())
        ) {
          team.teamMembers.push({ user: memberId, roleInTeam: "player" });
          await User.findByIdAndUpdate(memberId, {
            teamId: team._id,
            $push: {
              roles: {
                scope: "team",
                role: Roles.TEAM.PLAYER,
                scopeId: team._id,
                scopeModel: Scopes.TEAM,
              },
            },
          }, { session });
        }
      })
    );

    await team.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Members added successfully to the team.",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export const removeMember = TryCatchHandler(async (req, res, next) => {
  const memberId = req.params.id;
  const team = req.teamDoc;

  if (memberId.toString() === team.captain.toString())
    throw new CustomError("Captain cannot remove themselves.", 400);

  const memberIndex = team.teamMembers.findIndex(
    (m) => m.user.toString() === memberId.toString()
  );

  if (memberIndex === -1)
    throw new CustomError("Member not found in the team.", 404);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    team.teamMembers.splice(memberIndex, 1);
    await team.save({ session });

    await User.findByIdAndUpdate(memberId, { teamId: null }, { session });

    // Generate notification for the kicked member
    await createNotification({
      recipient: memberId,
      sender: req.user.userId,
      type: "TEAM_KICK",
      content: {
        title: "Kicked from Team",
        message: `You have been removed from the team ${team.teamName} by the captain.`,
      },
      relatedData: {
        teamId: team._id,
      },
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Member removed successfully.",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export const leaveMember = TryCatchHandler(async (req, res, next) => {
  const user = req.userDoc;
  const team = req.teamDoc;

  if (team.captain.toString() === user._id.toString()) {
    throw new CustomError(
      "You are the captain. Transfer captaincy or disband the team before leaving.",
      403
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove user from teamMembers
    team.teamMembers = team.teamMembers.filter(
      (member) => member.user.toString() !== user._id.toString()
    );
    await team.save({ session });

    // Remove teamId from user and clear team-related roles
    user.teamId = null;
    user.roles = user.roles.filter(
      (r) => r.scope !== "team" || r.scopeId?.toString() !== team._id.toString()
    );
    await user.save({ session });

    // Generate notification for the team captain
    await createNotification({
      recipient: team.captain,
      sender: req.user.userId,
      type: "TEAM_LEAVE",
      content: {
        title: "Member Left Team",
        message: `${user.username} has left the team ${team.teamName}.`,
      },
      relatedData: {
        teamId: team._id,
      },
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "You have successfully left the team.",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export const transferTeamOwnerShip = TryCatchHandler(async (req, res, next) => {
  const { memberId } = req.body;
  if (!memberId)
    throw new CustomError("Please provide a member ID to assign as captain.", 400);

  const team = req.teamDoc;
  const user = req.userDoc;

  // Check if the new member is part of the team
  const isMember = team.teamMembers.some(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!isMember)
    throw new CustomError("The selected member is not part of your team.", 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update roles in teamMembers array
    team.teamMembers = team.teamMembers.map((member) => {
      if (member.user.toString() === memberId.toString()) {
        return { ...member, roleInTeam: "igl" };
      } else if (member.user.toString() === user._id.toString()) {
        return { ...member, roleInTeam: "player" };
      }
      return member;
    });

    // Transfer igl
    team.captain = memberId;
    await team.save({ session });

    // Update old captain's roles
    user.roles = user.roles.map((r) =>
      r.scope === "team" && r.scopeId?.toString() === team._id.toString()
        ? { ...r, role: Roles.TEAM.PLAYER }
        : r
    );
    await user.save({ session });

    // Update new captain's roles
    const newCaptain = await findUserById(memberId);
    newCaptain.roles = newCaptain.roles.map((r) =>
      r.scope === "team" && r.scopeId?.toString() === team._id.toString()
        ? { ...r, role: Roles.TEAM.OWNER }
        : r
    );
    await newCaptain.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Team ownership transferred successfully.",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export const manageMemberRole = TryCatchHandler(async (req, res, next) => {
  const { memberId, role } = req.body;
  if (!memberId) throw new CustomError("Member ID is required.", 400);
  if (!role) throw new CustomError("Role is required.", 400);
  if (role === "igl")
    throw new CustomError("You cannot assign the 'igl' role manually.", 400);

  const team = req.teamDoc;

  const member = team.teamMembers.find(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!member) {
    throw new CustomError("The specified user is not a member of the team.", 404);
  }
  if (
    member.roleInTeam === "igl" &&
    member.user.toString() === req.user.userId.toString()
  ) {
    throw new CustomError("IGL cannot change their own role.", 403);
  }

  member.roleInTeam = role;
  await team.save();

  res.status(200).json({
    success: true,
    message: `The member's role has been updated to '${role}'.`,
    team,
  });
});

export const deleteTeam = TryCatchHandler(async (req, res, next) => {
  const team = req.teamDoc;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Set teamId = null and remove team roles for all team members
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
      },
      { session }
    );

    // Soft delete the team by setting isDeleted to true
    team.isDeleted = true;
    await team.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// to-do  - whatif memeber left the team ? automatic letf form the evenst register and what?
// to-do  --> using socket.io emit real time events to users
// TODO: invalidate the user cache to when someting change in database
