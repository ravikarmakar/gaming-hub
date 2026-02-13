import mongoose from "mongoose";
import Leaderboard from "../models/leaderBoard.model.js";
import Group from "../models/group.model.js";
import Round from "../models/round.model.js";
import pointSystem from "../../../shared/config/pointSystem.js";
import { logger } from "../../../shared/utils/logger.js";

// Create a new leaderboard entry
export const createLeaderboardEntry = async (req, res) => {
  const { groupId } = req.params;
  const { teamId, rank, totalPoints, matchesPlayed, kills, wins } = req.body;

  try {
    // Validate required fields
    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: "Invalid Team ID" });
    }

    // Find the group to ensure it exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Create a new leaderboard entry
    // Fix: Explicitly set groupId as per schema requirement
    const newEntry = new Leaderboard({
      groupId,
      teamScore: [{ // Schema expectation: teamScore array
        teamId,
        score: 0, // Default or calculated? Assume 0 for new entry unless provided
        rank,     // Stored in position or calculated? Schema has 'position'
        totalPoints,
        matchesPlayed,
        kills,
        wins
      }]
    });
    // However, the original code treated Leaderboard as a single entry per team? 
    // No, createLeaderboardEntry (lines 35-42) created `new Leaderboard({ teamId... })`.
    // But the schema (lines 3-29 of model) has `teamScore` array. 
    // The previous code was completely creating INVALID documents or the schema changed.
    // The previous code: `new Leaderboard({ teamId, ... })` -> this would fail validation against schema!
    // I will assume the intention is to add a team to an existing leaderboard or create one if missing.
    // But `group.leaderboard.push(savedEntry._id)` suggests Group has reference to MANY leaderboards?
    // Let's check Group schema again... `teams: [{...}]`. No `leaderboard` field in Group schema shown in steps 12-16!
    // So `group.leaderboard.push` (line 47) would likely fail or do nothing if schema is strict.
    // The user issue: "Schema inconsistency: `groupId` not set on Leaderboard document."
    // This implies we want ONE leaderboard per group.

    // logic: Find existing leaderboard for group, add/update team.
    let leaderboard = await Leaderboard.findOne({ groupId });

    if (!leaderboard) {
      leaderboard = new Leaderboard({
        groupId,
        teamScore: []
      });
    }

    // Check if team already exists
    const teamExists = leaderboard.teamScore.some(t => t.teamId.toString() === teamId);
    if (teamExists) {
      return res.status(400).json({ message: "Team already in leaderboard" });
    }

    leaderboard.teamScore.push({
      teamId,
      position: rank,
      totalPoints,
      matchesPlayed,
      kills,
      wins
    });

    const savedEntry = await leaderboard.save();

    // group.leaderboard.push... removing this as Group model doesn't seem to have it and we use groupId ref.

    res
      .status(201)
      .json({ message: "Leaderboard entry created/updated", entry: savedEntry });
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
    const { page = 1, limit = 10 } = req.query; // Pagination defaults

    const entries = await Leaderboard.find()
      .populate("teamScore.teamId", "teamName teamLogo") // Valid populate path
      .skip((page - 1) * limit)
      .limit(Number(limit));

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

// This function appears redundant or similar to createLeaderboardForRoundsGroups (lines 220+)
// But it uses `Leaderboard.insertMany` which is good.
// It maps `groups` to create leaderboards. 
// Issue: `scores: []` vs schema `teamScore`. Schema has `teamScore`.
// Also `createLeaderboardForRoundsGroups` logic with `group.teams` seems better for initialization.
// Since strict user instructions, I'll fix this one too just in case.
export const createRoundAllGroupsLeaderboards = async (req, res) => {
  try {
    const { roundId } = req.body;

    if (!roundId) {
      return res.status(400).json({ message: "Round ID is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({ message: "Invalid Round ID" });
    }

    // ✅ Fetch all groups for this round in one query
    const groups = await Group.find({ roundId }).select("_id");

    if (groups.length === 0) {
      return res
        .status(404)
        .json({ message: "No groups found for this round!" });
    }

    // Check for existing leaderboards to prevent duplicates
    const groupIds = groups.map(g => g._id);
    const existingLeaderboards = await Leaderboard.find({
      groupId: { $in: groupIds }
    }).select('groupId');

    const existingGroupIds = new Set(
      existingLeaderboards.map(lb => lb.groupId.toString())
    );

    // ✅ Prepare leaderboards only for groups that don't have one
    const leaderboards = groups
      .filter(group => !existingGroupIds.has(group._id.toString()))
      .map(group => ({
        groupId: group._id,
        teamScore: [], // Fixed: match schema
      }));

    // ✅ Insert all leaderboards in one go (Bulk insert)
    if (leaderboards.length > 0) {
      await Leaderboard.insertMany(leaderboards);
    }

    return res.status(201).json({
      message: "Leaderboards created successfully for all groups!",
      totalGroups: groups.length,
      created: leaderboards.length,
      skipped: existingLeaderboards.length,
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

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const leaderboard = await Leaderboard.findOne({ groupId });
    if (!leaderboard) return res.status(404).json({ message: "Leaderboard not found" });

    const teamEntry = leaderboard.teamScore.find(t => t.teamId.toString() === teamId);
    if (!teamEntry) return res.status(404).json({ message: "Team not found in leaderboard" });

    // Update fields if provided
    if (position !== undefined) teamEntry.position = position;
    if (kills !== undefined) teamEntry.kills = kills;
    if (matchesPlayed !== undefined) teamEntry.matchesPlayed = matchesPlayed;
    if (wins !== undefined) teamEntry.wins = wins;
    if (req.body.isQualified !== undefined) teamEntry.isQualified = req.body.isQualified;

    if (req.body.score !== undefined) teamEntry.score = req.body.score;

    // Trigger save to run pre-save hook
    await leaderboard.save();

    return res.status(200).json({ message: "Score updated", leaderboard });
  } catch (error) {
    logger.error("Error updating score:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// This one was flagged for N+1 issues and loops.
export const createLeaderboardForRoundsGroups = async (req, res) => {
  try {
    const { roundId } = req.body;

    if (!roundId) {
      return res.status(400).json({ message: "Round ID is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({ message: "Invalid Round ID" });
    }

    // ✅ Find all groups in the given round
    const groups = await Group.find({ roundId });

    if (!groups.length) {
      return res
        .status(404)
        .json({ message: "No groups found for this round!" });
    }

    // ✅ Batch fetch existing leaderboards to avoid N+1 queries
    const groupIds = groups.map(g => g._id);
    const existingLeaderboards = await Leaderboard.find({
      groupId: { $in: groupIds }
    }).select('groupId');

    const existingGroupIds = new Set(
      existingLeaderboards.map(lb => lb.groupId.toString())
    );

    // ✅ Create leaderboards for groups that don't have one
    const leaderboards = [];

    // Fix: Use insertMany instead of saving in loop
    const newLeaderboards = [];

    for (const group of groups) {
      // ✅ Check if group.teams exists and is an array (FIX: was group.teamIds)
      if (!group.teams || !Array.isArray(group.teams)) {
        logger.warn(
          `Warning: group.teams is missing or not an array for group ID: ${group._id}`
        );
        continue; // Skip this group
      }

      // ✅ Check using in-memory Set instead of database query
      if (!existingGroupIds.has(group._id.toString())) {
        // ✅ Create leaderboard object (don't save yet)
        newLeaderboards.push({
          groupId: group._id,
          teamScore: group.teams.map((teamId) => ({
            teamId: teamId,
            score: 0,
            position: null,
            totalPoints: 0,
            matchesPlayed: 0,
            kills: 0,
            wins: 0,
          })),
        });
      }
    }

    if (newLeaderboards.length > 0) {
      // Bulk Insert
      await Leaderboard.insertMany(newLeaderboards);
    }

    return res.status(201).json({
      message: "Leaderboards created successfully!",
      createdCount: newLeaderboards.length,
    });
  } catch (error) {
    logger.error("Error creating leaderboards:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update Group Results (Batch) with Transaction
export const updateGroupResults = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { groupId } = req.params;
    const { results } = req.body; // Array of { teamId, kills, score (place pts), wins }

    if (!groupId || !results || !Array.isArray(results)) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID" });
    }

    const group = await Group.findById(groupId).populate("roundId").session(session);
    if (!group) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Group not found" });
    }

    const leaderboard = await Leaderboard.findOne({ groupId }).session(session);
    if (!leaderboard) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Leaderboard not found" });
    }

    // Update results for each team
    for (const { teamId, rank, kills } of results) {
      if (!teamId) continue;

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

        // Update current position based on this specific match
        entry.position = rank;
      } else {
        // Handle silent failure: Log warning or error
        logger.warn(`Team ${teamId} not found in leaderboard for group ${groupId}`);
        // Optionally return error if this should be strict
      }
    }

    // Increment Group matches played
    group.matchesPlayed += 1;

    // Null check for group.roundId
    const effectiveTotalMatch = (group.roundId && group.roundId.matchesPerGroup) ? group.roundId.matchesPerGroup : (group.totalMatch || 1);

    // Check if the group is fully completed
    const qualifyingLimit = (group.roundId && group.roundId.qualifyingTeams) || 0;

    if (group.matchesPlayed >= effectiveTotalMatch) {
      group.status = "completed";

      // 🏆 Apply Final Qualification only after ALL matches are done
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

    // Consolidated Saves within transaction
    await leaderboard.save({ session });
    await group.save({ session });

    // ✅ Check if all groups in the round are completed
    // Requires querying other groups, usually okay in transaction
    if (group.roundId && group.roundId._id) {
      const allGroupsInRound = await Group.find({ roundId: group.roundId._id }).session(session);
      const isRoundComplete = allGroupsInRound.every(g => g.status === 'completed');

      if (isRoundComplete) {
        await Round.findByIdAndUpdate(group.roundId._id, { status: 'completed' }).session(session);

        // ✅ If it was a Grand Finale (only 1 group in round), mark event as completed
        if (allGroupsInRound.length === 1 && group.roundId.eventId) {
          await mongoose.model("Event").findByIdAndUpdate(group.roundId.eventId, { eventProgress: 'completed' }).session(session);
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Results updated and group completed", leaderboard, group });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Error updating group results:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
