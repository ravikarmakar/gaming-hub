import mongoose from "mongoose";
import LeaderboardTeams from "../models/leaderBoard.model.js";
import Group from "../models/group.model.js";
import Leaderboard from "../models/leaderBoard.model.js";
import Round from "../models/round.model.js";
import pointSystem from "../../../shared/config/pointSystem.js";
import { logger } from "../../../shared/utils/logger.js";

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
    logger.error("Error creating leaderboard entry:", error);
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
    logger.error("Error fetching leaderboard entries:", error);
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

    // return logger.info(groups);

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
    logger.error("Error in createRoundLeaderboards:", error);
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
        path: "teamScore.teamId",
        select: "teamName teamLogo", // ✅ Select only needed fields
      })
      .lean(); // ✅ Convert result to plain JSON for faster response

    if (!leaderboard) {
      return res.status(404).json({ message: "Leaderboard not found!" });
    }

    return res.status(200).json(leaderboard);
  } catch (error) {
    logger.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTeamScore = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { teamId, position, kills, wins, matchesPlayed } = req.body;

    if (!groupId || !teamId) {
      return res.status(400).json({ message: "Group ID and Team ID are required" });
    }

    const leaderboard = await Leaderboard.findOne({ groupId });
    if (!leaderboard) return res.status(404).json({ message: "Leaderboard not found" });

    const teamEntry = leaderboard.teamScore.find(t => t.teamId.toString() === teamId);
    if (!teamEntry) return res.status(404).json({ message: "Team not found in leaderboard" });

    // Update fields if provided
    if (position !== undefined) teamEntry.position = position;
    if (kills !== undefined) teamEntry.kills = kills; // Add to existing or replace? User said "add a position point... somting like that". Usually editing is replacing or adding. I will assume replace for "Edit button" logic, or I'll assume the frontend calculates the total.
    // Actually, "edit button" usually implies updating the current match stats or total stats.
    // The model has `score`, `kills`, `wins`, `totalPoints`.
    // The pre-save hook calculates `totalPoints`.
    // Let's assume we are updating the current stats.
    if (matchesPlayed !== undefined) teamEntry.matchesPlayed = matchesPlayed;
    if (wins !== undefined) teamEntry.wins = wins;
    if (req.body.isQualified !== undefined) teamEntry.isQualified = req.body.isQualified; // ✅ Handle qualification update

    // Recalculate score based on some logic? Or user relies on pre-save?
    // The pre-save hook: team.totalPoints = team.score + team.kills * 2 + team.wins * 5;
    // But `score` is 0 by default. Wait, `score` in the schema usually refers to placement points.
    // If user inputs "Position points" (placement points), we should update `score`.
    // If user inputs "Kill points", we update `kills`.
    // Total points should be auto calculated.

    // Let's assume `score` is placement/position points.
    if (req.body.score !== undefined) teamEntry.score = req.body.score;

    // Trigger save to run pre-save hook
    await leaderboard.save();

    return res.status(200).json({ message: "Score updated", leaderboard });
  } catch (error) {
    logger.error("Error updating score:", error);
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
        logger.warn(
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
    logger.error("Error creating leaderboards:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update Group Results (Batch)
export const updateGroupResults = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { results } = req.body; // Array of { teamId, kills, score (place pts), wins }

    if (!groupId || !results || !Array.isArray(results)) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    const group = await Group.findById(groupId).populate("roundId");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const leaderboard = await Leaderboard.findOne({ groupId });
    if (!leaderboard) {
      return res.status(404).json({ message: "Leaderboard not found" });
    }

    // Update results for each team
    results.forEach(({ teamId, rank, kills }) => {
      const entry = leaderboard.teamScore.find(
        (t) => t.teamId.toString() === teamId.toString()
      );

      if (entry) {
        const placePoints = pointSystem.ranks[rank] || 0;
        // ⚡ Cumulative Multi-Match Logic
        entry.score += placePoints; // Accumulate Place Points
        entry.kills += (kills || 0); // Accumulate Kills
        if (rank === 1) entry.wins += 1; // Increment Wins if Match Rank 1
        entry.matchesPlayed += 1; // Increment matches for this team

        // Update current position based on this specific match (optional, but keep it for reference)
        entry.position = rank;
      }
    });

    // Sort leaderboard by Total Points BEFORE saving for cleaner pre-save hook data
    leaderboard.teamScore.sort((a, b) => b.totalPoints - a.totalPoints);

    // Increment Group matches played
    group.matchesPlayed += 1;

    const effectiveTotalMatch = group.roundId?.matchesPerGroup || group.totalMatch || 1;

    // Check if the group is fully completed
    if (group.matchesPlayed >= effectiveTotalMatch) {
      group.status = "completed";

      // 🏆 Apply Final Qualification only after ALL matches are done
      const qualifyingLimit = group.roundId.qualifyingTeams || 0;
      leaderboard.teamScore.forEach((entry, index) => {
        if (qualifyingLimit > 0 && index < qualifyingLimit) {
          entry.isQualified = true;
        } else {
          entry.isQualified = false;
        }
      });
    } else {
      group.status = "ongoing";
    }

    // Consolidated Saves
    await Promise.all([
      leaderboard.save(),
      group.save()
    ]);

    // ✅ Check if all groups in the round are completed
    const allGroupsInRound = await Group.find({ roundId: group.roundId._id });
    const isRoundComplete = allGroupsInRound.every(g => g.status === 'completed');

    if (isRoundComplete) {
      await Round.findByIdAndUpdate(group.roundId._id, { status: 'completed' });

      // ✅ If it was a Grand Finale (only 1 group in round), mark event as completed
      if (allGroupsInRound.length === 1) {
        await mongoose.model("Event").findByIdAndUpdate(group.roundId.eventId, { eventProgress: 'completed' });
      }
    }

    res.status(200).json({ message: "Results updated and group completed", leaderboard, group });

  } catch (error) {
    logger.error("Error updating group results:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
