import mongoose from "mongoose";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { findUserById } from "../services/user.service.js";
import {
  checkTeamNameUnique,
  createNewTeam,
  findTeamById,
} from "../services/team.service.js";

export const createTeam = TryCatchHandler(async (req, res, next) => {
  const { teamName } = req.body;
  const { userId } = req.user;
  const imageFile = req.file;

  await checkTeamNameUnique(teamName);

  const user = await findUserById(userId);
  if (user.teamId)
    return next(new CustomError("You are already in a team", 400));

  if (!user.isAccountVerified)
    return next(new CustomError("Account is not verified yet", 401));

  // handle image uplaoding logic here
  const imageUrl = "https://cloudinary/dummy-image-url";

  const teamData = {
    teamName,
    captain: user._id,
    imageUrl,
    teamMembers: [{ user: user._id, roleInTeam: "igl" }],
  };

  const newTeam = await createNewTeam(teamData);

  user.teamId = newTeam._id;

  await user.save();

  res.status(201).json({
    success: true,
    message: "Team created successfully",
    team: newTeam,
  });
});

export const updateTeam = TryCatchHandler(async (req, res, next) => {
  const { teamName, bio } = req.body;
  const { userId } = req.user;
  const imageFile = true;

  const user = await findUserById(userId);
  if (!user.teamId)
    return next(
      new CustomError("You are not part of any team to update details.", 400)
    );

  if (!user.isAccountVerified)
    return next(new CustomError("Account is not verified yet", 401));

  const team = await findTeamById(user.teamId);
  if (userId.toString() !== team.captain.toString())
    return next(
      new CustomError("You are not authorized to update this team.", 403)
    );

  // handle image uplaoding logic here
  let imageUrl = team.imageUrl;
  if (imageFile) {
    // uplaoding logiic here
    imageUrl = "https://cloudinary/dummy-image-url/updated-url";
  }

  if (teamName) team.teamName = teamName;
  if (bio) team.bio = bio;
  team.imageUrl = imageUrl;

  await team.save();

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    team,
  });
});

export const fetchTeamDetails = TryCatchHandler(async (req, res, next) => {
  const { teamId } = req.params;

  const team = await Team.aggregate([
    {
      $match: { isDeleted: false },
    },
    {
      $match: { _id: new mongoose.Types.ObjectId(teamId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "teamMembers.user",
        foreignField: "_id",
        as: "membersInfo",
      },
    },
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
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$membersInfo",
                          as: "info",
                          cond: {
                            $eq: ["$$info._id", "$$member.user"],
                          },
                        },
                      },
                      as: "matchedUser",
                      in: "$$matchedUser.username",
                    },
                  },
                  0,
                ],
              },
              avatar: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$membersInfo",
                          as: "info",
                          cond: {
                            $eq: ["$$info._id", "$$member.user"],
                          },
                        },
                      },
                      as: "matchedUser",
                      in: "$$matchedUser.avatar",
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        membersInfo: 0, // remove temp joined data
        __v: 0,
      },
    },
  ]);

  if (!team || team.length === 0) {
    return next(new CustomError("Team not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Team details fetched successfully",
    team: team[0],
  });
});

export const fetchAllTeams = TryCatchHandler(async (req, res) => {
  const teams = await Team.aggregate([
    // 1. Lookup teamMembers.user => users
    {
      $match: { isDeleted: false },
    },

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
  ]);

  res.status(200).json({
    message: "Fetched all teams successfully",
    teams,
  });
});

export const addMembers = TryCatchHandler(async (req, res, next) => {
  const { members } = req.body;

  if (!Array.isArray(members) || members.length < 1)
    return next(
      new CustomError("Please provide at least one team member.", 400)
    );

  const currentUser = await findUserById(req.user.userId);
  if (!currentUser.teamId)
    return next(new CustomError("You are not part of any team.", 400));

  const team = await findTeamById(currentUser.teamId);
  if (req.user.userId.toString() !== team.captain.toString())
    return next(new CustomError("Only captain can add members.", 403));

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
    return next(
      new CustomError(
        `Users with usernames: ${issues.withTeam.join(
          ", "
        )} already belong to a team.`,
        400
      )
    );

  if (issues.unverified.length)
    return next(
      new CustomError(
        `Users with usernames: ${issues.unverified.join(
          ", "
        )} have not verified their email.`,
        400
      )
    );

  // Add new members and update user.teamId
  await Promise.all(
    members.map(async (memberId) => {
      if (
        !team.teamMembers.some((m) => m.user.toString() === memberId.toString())
      ) {
        team.teamMembers.push({ user: memberId, roleInTeam: "player" });
        await User.findByIdAndUpdate(memberId, { teamId: team._id });
      }
    })
  );

  await team.save();

  res.status(200).json({
    success: true,
    message: "Members added successfully to the team.",
    team,
  });
});

export const removeMember = TryCatchHandler(async (req, res, next) => {
  const { memberId } = req.body;

  if (!memberId)
    return next(new CustomError("Please provide a member ID to remove.", 400));

  const currentUser = await findUserById(req.user.userId);
  if (!currentUser.teamId)
    return next(new CustomError("You are not part of any team.", 400));

  const team = await findTeamById(currentUser.teamId);

  // Only captain can remove members
  if (req.user.userId.toString() !== team.captain.toString())
    return next(new CustomError("Only captain can remove members.", 403));

  // Prevent captain from removing himself
  if (memberId.toString() === team.captain.toString())
    return next(new CustomError("Captain cannot remove themselves.", 400));

  // Check if the member exists in the team
  const memberIndex = team.teamMembers.findIndex(
    (m) => m.user.toString() === memberId.toString()
  );

  if (memberIndex === -1)
    return next(new CustomError("Member not found in the team.", 404));

  // Remove member from team
  team.teamMembers.splice(memberIndex, 1);
  await team.save();

  // Clear the user's teamId
  await User.findByIdAndUpdate(memberId, { teamId: null });

  res.status(200).json({
    success: true,
    message: "Member removed successfully.",
    team,
  });
});

export const leaveMember = TryCatchHandler(async (req, res, next) => {
  const user = await findUserById(req.user.userId);

  // Check if user is part of a team
  if (!user.teamId)
    return next(new CustomError("You are not part of any team.", 400));

  const team = await findTeamById(user.teamId);

  // Check if the user is the captain
  if (team.captain.toString() === user._id.toString()) {
    return next(
      new CustomError(
        "You are the captain. Transfer captaincy or disband the team before leaving.",
        403
      )
    );
  }

  // Remove user from teamMembers
  team.teamMembers = team.teamMembers.filter(
    (member) => member.user.toString() !== user._id.toString()
  );

  await team.save();

  // Remove teamId from user
  user.teamId = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "You have successfully left the team.",
  });
});

export const transferTeamOwnerShip = TryCatchHandler(async (req, res, next) => {
  const { memberId } = req.body;

  if (!memberId)
    return next(
      new CustomError("Please provide a member ID to assign as captain.", 400)
    );

  const user = await findUserById(req.user.userId);
  if (!user.teamId)
    return next(new CustomError("You are not part of any team.", 400));

  const team = await findTeamById(user.teamId);
  if (team.captain.toString() !== user._id.toString())
    return next(new CustomError("Only captain can transfer ownership.", 403));

  // Check if the new member is part of the team
  const isMember = team.teamMembers.some(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!isMember)
    return next(
      new CustomError("The selected member is not part of your team.", 400)
    );

  // Update roles: new captain and old captain
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

  await team.save();

  res.status(200).json({
    success: true,
    message: "Team ownership transferred successfully.",
    team,
  });
});

export const manageMemberRole = TryCatchHandler(async (req, res, next) => {
  const { memberId, role } = req.body;
  if (!memberId) return next(new CustomError("Member ID is required.", 400));
  if (!role) return next(new CustomError("Role is required.", 400));
  if (role === "igl")
    return next(
      new CustomError("You cannot assign the 'igl' role manually.", 400)
    );

  const currentUser = await findUserById(req.user.userId);
  if (!currentUser.teamId)
    return next(new CustomError("You are not part of any team.", 400));

  const team = await findTeamById(currentUser.teamId);
  if (req.user.userId.toString() !== team.captain.toString())
    return next(
      new CustomError("Only the team captain can manage member roles.", 403)
    );

  const member = team.teamMembers.find(
    (m) => m.user.toString() === memberId.toString()
  );

  if (!member) {
    return next(
      new CustomError("The specified user is not a member of the team.", 404)
    );
  }
  if (
    member.roleInTeam === "igl" &&
    member.user.toString() === req.user.userId.toString()
  ) {
    return next(new CustomError("IGL cannot change their own role.", 403));
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
  const user = await findUserById(req.user.userId);

  if (!user.teamId)
    return next(new CustomError("You are not part of any team.", 400));

  const team = await findTeamById(user.teamId);

  if (req.user.userId.toString() !== team.captain.toString())
    return next(
      new CustomError("Only the team captain can delete the team.", 403)
    );

  // Set teamId = null for all team members
  const memberIds = team.teamMembers.map((member) => member.user);
  await User.updateMany(
    { _id: { $in: memberIds } },
    {
      $set: { teamId: null },
    }
  );

  // Soft delete the team by setting isDeleted to true
  team.isDeleted = true;
  await team.save();

  res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
});

// to-do  - whatif memeber left the team ? automatic letf form the evenst register and what?
// to-do  --> using socket.io emit real time events to users
