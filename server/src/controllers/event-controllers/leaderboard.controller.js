import mongoose from "mongoose";
import LeaderboardTeams from "../../models/event-model/leaderBoard.model.js";
import Group from "../../models/event-model/group.model.js";
import Leaderboard from "../../models/event-model/leaderBoard.model.js";

// Create a new leaderboard entry
export const createLeaderboardEntry = async (req, res) => {
  const { groupId } = req.params; // Corrected the parameter name
  const { teamId, rank, totalPoints, matchesPlayed, kills, wins } = req.body;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID" });
    }

    // Find the group to ensure it exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Create a new leaderboard entry
    const newEntry = new LeaderboardTeams({
      teamId,
      rank,
      totalPoints,
      matchesPlayed,
      kills,
      wins,
    });

    const savedEntry = await newEntry.save();

    // Add the leaderboard entry to the group's leaderboard array
    group.leaderboard.push(savedEntry._id);
    await group.save();

    res
      .status(201)
      .json({ message: "Leaderboard entry created", entry: savedEntry });
  } catch (error) {
    console.error("Error creating leaderboard entry:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all leaderboard entries
export const getLeaderboardEntries = async (req, res) => {
  try {
    const entries = await LeaderboardTeams.find().populate("teamId");
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching leaderboard entries:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getLeaderboardDetails = async (req, res) => {
  try {
    const { leaderboardId } = req.params;

    // Check if ID is valid (MongoDB ObjectId format)
    if (!leaderboardId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const leaderboard = await Leaderboard.findById(leaderboardId);

    if (!leaderboard) {
      return res.status(404).json({ message: "Leaderboard not found" });
    }

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createRoundAllGroupsLeaderboards = async (req, res) => {
  try {
    const { roundId } = req.body;

    if (!roundId) {
      return res.status(400).json({ message: "Round ID is required!" });
    }

    // ✅ Fetch all groups for this round in one query
    const groups = await Group.find({ roundId }).select("_id");

    if (groups.length === 0) {
      return res
        .status(404)
        .json({ message: "No groups found for this round!" });
    }

    // return console.log(groups);

    // ✅ Prepare leaderboards for all groups
    const leaderboards = groups.map((group, i) => ({
      groupId: group._id,
      scores: [],
    }));

    // ✅ Insert all leaderboards in one go (Bulk insert)
    await Leaderboard.insertMany(leaderboards);

    return res.status(201).json({
      message: "Leaderboards created successfully for all groups!",
      totalGroups: groups.length,
    });
  } catch (error) {
    console.error("Error in createRoundLeaderboards:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLeaderboardByGroup = async (req, res) => {
  try {
    const { groupId } = req.params; // ✅ Group ID from URL params

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required!" });
    }

    // ✅ Fetch leaderboard with populated team details (only necessary fields)
    const leaderboard = await Leaderboard.findOne({ groupId })
      .populate({
        path: "scores.teamId",
        select: "teamName logo", // ✅ Select only needed fields
      })
      .lean(); // ✅ Convert result to plain JSON for faster response

    if (!leaderboard) {
      return res.status(404).json({ message: "Leaderboard not found!" });
    }

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createLeaderboardForRoundsGroups = async (req, res) => {
  try {
    const { roundId } = req.body;

    if (!roundId) {
      return res.status(400).json({ message: "Round ID is required!" });
    }

    // ✅ Find all groups in the given round
    const groups = await Group.find({ roundId });

    if (!groups.length) {
      return res
        .status(404)
        .json({ message: "No groups found for this round!" });
    }

    // ✅ Create leaderboards for all groups
    const leaderboards = [];

    for (const group of groups) {
      // ✅ Check if group.teamIds exists and is an array
      if (!group.teamIds || !Array.isArray(group.teamIds)) {
        console.warn(
          `Warning: group.teamIds is missing or not an array for group ID: ${group._id}`
        );
        continue; // Skip this group
      }

      // ✅ Check if leaderboard already exists
      const existingLeaderboard = await Leaderboard.findOne({
        groupId: group._id,
      });

      if (!existingLeaderboard) {
        // ✅ Create leaderboard for this group
        const leaderboard = new Leaderboard({
          groupId: group._id,
          teamScore: group.teamIds.map((teamId) => ({
            teamId: teamId, // Directly use teamId instead of accessing non-existent `team._id`
            score: 0,
            position: null,
            totalPoints: 0,
            matchesPlayed: 0,
            kills: 0,
            wins: 0,
          })),
        });

        await leaderboard.save();
        leaderboards.push(leaderboard);
      }
    }

    return res.status(201).json({
      message: "Leaderboards created successfully!",
      leaderboards,
    });
  } catch (error) {
    console.error("Error creating leaderboards:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
