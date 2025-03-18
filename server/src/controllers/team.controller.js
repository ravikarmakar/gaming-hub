import mongoose from "mongoose";
import Team from "../models/team.model.js";
import TeamNotification from "../models/notification-model/team.notification.model.js";
import User from "../models/user.model.js";

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate("captain", "username email") // Populate captain details S
      .populate("members.userId", "username email"); // Populate team members

    res.status(200).json({ message: "Get all teams successfully", teams });
  } catch (error) {
    console.error(`Error in getAllTeams : ${error.message}`);
    res.status(500).json({ message: "Server error while getting all teams" });
  }
};

export const getTeamProfile = async (req, res) => {
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId)
      .populate("captain", "username email")
      .populate("members.userId", "name email");

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    res.status(200).json({ success: true, team: team });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createTeams = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { teamName } = req.body;

    // Checking Empty field
    if (!teamName) {
      return res
        .status(400)
        .json({ success: false, message: "Team name is required." });
    }

    // Prevent user from creating multiple teams
    if (loggedInUser.activeTeam) {
      return res.status(400).json({
        success: false,
        message: "You have already created a team.",
      });
    }

    // Check if team with the same name exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res
        .status(400)
        .json({ success: false, message: "Team name already exists." });
    }

    // Creating New Team
    const newTeam = new Team({
      teamName,
      owner: loggedInUser._id,
      members: {
        userId: loggedInUser._id,
        role: "owner",
      },
    });

    const savedTeam = await newTeam.save();

    await User.findByIdAndUpdate(
      loggedInUser._id,
      {
        $set: {
          activeTeam: savedTeam._id,
          teamCreator: true,
        },
        $inc: {
          createdTeamCount: 1,
        },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: savedTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  const loggedInUser = req.user;

  try {
    const team = await Team.findById(loggedInUser.activeTeam);

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    const memberIds = team.members.map((member) => member.userId);

    // Notify members
    for (const member of team.members) {
      await TeamNotification.create({
        user: member.userId,
        type: "announcement",
        message: `Your team ${team.teamName} has been deleted.`,
        relatedId: team._id,
      });
    }

    await User.updateMany(
      { _id: { $in: [...memberIds, team.owner, team.captain] } },
      {
        $unset: { activeTeam: null },
        $set: { teamCreator: false },
        $inc: { notificationCount: 1 },
      }
    );

    // Ab team ko delete karte hain
    await Team.findByIdAndDelete(team._id);

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error(`Error in deleteTeam : ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting team" });
  }
};

export const memberleaveTeam = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Find the team
    const team = await Team.findById(loggedInUser.activeTeam);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Find the user in members list
    const userIndex = team.members.findIndex((member) =>
      member.userId.equals(loggedInUser._id)
    );

    if (userIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this team.",
      });
    }

    const userRole = team.members[userIndex].role;

    // If user is the Owner, they cannot leave without transferring ownership
    if (team.owner.equals(loggedInUser._id)) {
      return res.status(400).json({
        success: false,
        message: "Owner cannot leave the team. Transfer ownership first.",
      });
    }

    // If user is the Captain, ensure there is another Captain before leaving
    if (userRole === "captain") {
      return res.status(400).json({
        success: false,
        message: "Assign a new Captain before leaving the team.",
      });
    }

    // Remove the user from members array
    team.members.splice(userIndex, 1);
    await team.save();

    // Update user schema
    await User.findByIdAndUpdate(loggedInUser._id, {
      activeTeam: null,
    });

    // Notify owner
    await TeamNotification.create({
      user: team.owner,
      type: "team_update",
      status: "unread",
      message: `${loggedInUser.name} has left the team.`,
      relatedId: team._id,
    });

    await User.findByIdAndUpdate(team.owner, {
      $inc: { notificationCount: 1 },
    });

    res
      .status(200)
      .json({ success: true, message: "You have successfully left the team." });
  } catch (error) {
    console.error("Error leaving team:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { memberId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Member ID" });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    // Find the team
    const team = await Team.findById(loggedInUser.activeTeam);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    if (!team.owner.equals(loggedInUser._id)) {
      return res.status(404).json({
        success: false,
        message: "You can't authorized to kick members",
      });
    }

    // Find the role of logged-in user & target member
    const userInTeam = team.members.find((m) =>
      m.userId.equals(loggedInUser._id)
    );

    const targetMember = team.members.find((m) => m.userId.equals(memberId));

    if (!userInTeam || !targetMember) {
      return res
        .status(400)
        .json({ success: false, message: "Member not found in the team." });
    }

    const userRole = userInTeam.role; // Owner/Captain/Player/Substitute
    const targetRole = targetMember.role; // Role of the member to be removed

    // 🔹 Only Owner Can Remove Members
    if (userRole !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the Owner can remove members.",
      });
    }

    // 🔹 Owner Cannot Directly Remove Captain
    if (targetRole === "captain") {
      return res.status(403).json({
        success: false,
        message: "Transfer captain role before removing them.",
      });
    }

    // 🔹 Remove Member from Team
    team.members = team.members.filter((m) => !m.userId.equals(memberId));
    await team.save();

    // Update user schema
    await User.findByIdAndUpdate(memberId, { activeTeam: null });

    // Notify the kicked member
    await TeamNotification.create({
      user: member._id,
      type: "team_update",
      isRead: false,
      message: `You have been removed from the team by ${loggedInUser.name}.`,
      relatedId: team._id,
    });

    await User.findByIdAndUpdate(memberId, { $inc: { notificationCount: 1 } });

    res
      .status(200)
      .json({ success: true, message: "Member removed successfully." });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}; // to-do

export const transferRole = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { memberId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid member ID" });
    }

    const member = await findById(memberId);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member Not found" });
    }

    const team = await Team.findById(loggedInUser.activeTeam);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team Not found" });
    }

    if (!team.owner.equals(loggedInUser._id)) {
      return res.status(404).json({
        success: false,
        message: "You can't authorized to transfer role to member",
      });
    }

    // Find the role of logged-in user & target member
    const userInTeam = team.members.find((m) =>
      m.userId.equals(loggedInUser._id)
    );

    const targetMember = team.members.find((m) => m.userId.equals(memberId));

    if (!userInTeam || !targetMember) {
      return res
        .status(400)
        .json({ success: false, message: "Member not found in the team." });
    }

    const userRole = userInTeam.role; // Owner/Captain/Player/Substitute
    const targetRole = targetMember.role; // Role of the member to be removed
  } catch (error) {
    console.error("Error transfer role :", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}; // to-do

export const assignTeamCaptain = async (req, res) => {
  try {
    const { captainId } = req.body;
    const loggedInUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(captainId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid captain ID" });
    }

    // Logged-in user ki active team check karo
    const team = await Team.findById(loggedInUser.activeTeam);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Agar logged-in user owner nahi hai, to deny karo
    if (team.owner.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team owner can assign a captain",
      });
    }

    // Check karo ki captainId team ke members me hai ya nahi
    const member = team.members.find((m) => m.userId.toString() === captainId);
    if (!member) {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a team member",
      });
    }

    // ✅ **Extra Check** - Agar member ka role pehle se "Captain" nahi hai to allow karein
    if (member.role === "captain") {
      return res.status(400).json({
        success: false,
        message: "User is already the team captain",
      });
    }

    // ✅ **Fix for undefined captain error**
    team.members = team.members.map((m) => {
      if (team.captain && m.userId.toString() === team.captain.toString()) {
        return { ...m.toObject(), role: "player" }; // Previous captain -> player
      }
      if (m.userId.toString() === captainId) {
        return { ...m.toObject(), role: "captain" }; // New captain
      }
      return m;
    });

    // Naya captain assign karo
    team.captain = captainId;
    await team.save();

    // ✅ **Notify new captain**
    await TeamNotification.create({
      user: captainId,
      type: "team_update",
      status: "unread",
      message: `You are the new team captain.`,
      relatedId: team._id,
    });

    // ✅ **Increment notification count for new captain**
    await User.findByIdAndUpdate(captainId, {
      $inc: { notificationCount: 1 },
    });

    res.status(200).json({
      success: true,
      message: "New captain assigned successfully",
    });
  } catch (error) {
    console.error("Error in assignTeamCaptain:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}; // to-do
