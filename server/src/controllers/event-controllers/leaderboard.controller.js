import mongoose from "mongoose";
import LeaderboardTeams from "../../models/event-model/leaderBoard.model.js";
import Group from "../../models/event-model/group.model.js";

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
