import mongoose from "mongoose";
import Leaderboard from "../models/leaderBoard.model.js";
import Group from "../models/group.model.js";
import Round from "../models/round.model.js";
import pointSystem from "../../../shared/config/pointSystem.js";
import { logger } from "../../../shared/utils/logger.js";
import { withOptionalTransaction } from "../../../shared/utils/withOptionalTransaction.js";

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
// For league groups: accepts pairingType ("AxB" | "BxC" | "AxC") to filter which 12 teams are updated
export const updateGroupResults = async (req, res) => {
  const { groupId } = req.params;
  const { results, pairingType } = req.body;

  if (!groupId || !results || !Array.isArray(results)) {
    return res.status(400).json({ message: "Invalid data provided" });
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid Group ID" });
  }

  // Validate pairingType for league tournaments
  if (pairingType && !["AxB", "BxC", "AxC"].includes(pairingType)) {
    return res.status(400).json({ message: "Invalid pairing type provided" });
  }

  try {
    const { leaderboard, group } = await withOptionalTransaction(async (session) => {
      const groupQuery = Group.findById(groupId).populate("roundId");
      if (session) groupQuery.session(session);
      const group = await groupQuery;
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const lbQuery = Leaderboard.findOne({ groupId });
      if (session) lbQuery.session(session);
      const leaderboard = await lbQuery;
      if (!leaderboard) {
        return res.status(404).json({ message: "Leaderboard not found" });
      }

      // 🏆 Calculate effective match limit
      const roundMatchesPerGroup = group.roundId?.matchesPerGroup;
      const effectiveTotalMatch = group.isLeague 
        ? (roundMatchesPerGroup ? roundMatchesPerGroup * 3 : (group.totalMatch || 18))
        : (roundMatchesPerGroup || group.totalMatch || 1);

      // 🚫 Block if the group is already fully completed
      if (group.status === "completed") {
        const err = new Error(
          `All ${effectiveTotalMatch} match${effectiveTotalMatch > 1 ? "es" : ""} have already been submitted for this group. No further result submissions are allowed.`
        );
        err.status = 400;
        err.matchesPlayed = group.matchesPlayed;
        err.totalMatch = effectiveTotalMatch;
        throw err;
      }

      // 🏆 League sub-group pairing filter (AxB / BxC / AxC)
      // When pairingType is given, restrict result updates to only the 12 teams in those 2 sub-groups.
      // Teams in the 3rd sub-group are NOT updated — their matchesPlayed stays unchanged.
      let activeTeamIds = null; // null = update all (standard mode)
      if (group.isLeague && pairingType) {
        // Enforce per-pairing match limit tracking (e.g. 6 per pair if total=18)
        const pairingLimit = Math.floor(effectiveTotalMatch / 3);
        const currentPairingCount = group.pairingMatches?.[pairingType] || 0;

        if (currentPairingCount >= pairingLimit) {
          const err = new Error(
            `Match limit reached: All ${pairingLimit} matches for pairing ${pairingType} (e.g. ${pairingType.split('x').join(' & ')}) have already been submitted.`
          );
          err.status = 400;
          throw err;
        }

        if (group.subGroups?.length === 3) {
          // Use stored subGroups if they exist
          const [sgA, sgB, sgC] = group.subGroups;
          const toStrSet = (teams) => new Set((teams || []).map(id => id.toString()));
          const setA = toStrSet(sgA.teams);
          const setB = toStrSet(sgB.teams);
          const setC = toStrSet(sgC.teams);

          if (pairingType === "AxB") activeTeamIds = new Set([...setA, ...setB]);
          else if (pairingType === "BxC") activeTeamIds = new Set([...setB, ...setC]);
          else if (pairingType === "AxC") activeTeamIds = new Set([...setA, ...setC]);
        } else {
          // Fallback: If subGroups are missing, derive from leaderboard position (matching frontend fallback)
          const allTeams = leaderboard.teamScore.map(t => t.teamId.toString());
          const chunkSize = Math.ceil(allTeams.length / 3);
          const setA = new Set(allTeams.slice(0, chunkSize));
          const setB = new Set(allTeams.slice(chunkSize, chunkSize * 2));
          const setC = new Set(allTeams.slice(chunkSize * 2));

          if (pairingType === "AxB") activeTeamIds = new Set([...setA, ...setB]);
          else if (pairingType === "BxC") activeTeamIds = new Set([...setB, ...setC]);
          else if (pairingType === "AxC") activeTeamIds = new Set([...setA, ...setC]);
        }

        // Initialize pairingMatches if missing
        if (!group.pairingMatches) {
          group.pairingMatches = { AxB: 0, BxC: 0, AxC: 0 };
        }
        // Increment the specific pairing counter
        group.pairingMatches[pairingType] = (group.pairingMatches[pairingType] || 0) + 1;
        group.markModified('pairingMatches');
      }

      // Update leaderboard results for each team in this match
      for (const { teamId, rank, kills } of results) {
        if (!teamId) continue;
        const teamIdStr = teamId.toString();

        // Skip teams not in the active pairing (for league groups)
        if (activeTeamIds && !activeTeamIds.has(teamIdStr)) continue;

        const entry = leaderboard.teamScore.find(
          (t) => t.teamId.toString() === teamIdStr
        );

        if (entry) {
          const placePoints = pointSystem.ranks[rank] || 0;
          entry.score = (entry.score || 0) + placePoints;
          entry.kills = (entry.kills || 0) + (kills || 0);
          if (rank === 1) entry.wins = (entry.wins || 0) + 1;
          entry.matchesPlayed = (entry.matchesPlayed || 0) + 1;
          entry.position = rank;
        } else {
          logger.warn(`Team ${teamId} not found in leaderboard for group ${groupId}`);
        }
      }

      // Increment Group-level matches played
      const matchesPlayedCount = (group.matchesPlayed || 0) + 1;
      group.matchesPlayed = matchesPlayedCount;

      const qualifyingLimit = (group.roundId?.qualifyingTeams) || 0;

      if (matchesPlayedCount >= effectiveTotalMatch) {
        group.status = "completed";
        group.totalSelectedTeam = qualifyingLimit;

        leaderboard.teamScore.forEach(entry => {
          entry.totalPoints = (entry.score || 0) + (entry.kills || 0);
        });

        leaderboard.teamScore.sort((a, b) => b.totalPoints - a.totalPoints);

        leaderboard.teamScore.forEach((entry, index) => {
          entry.isQualified = qualifyingLimit > 0 && index < qualifyingLimit;
        });
        leaderboard.markModified('teamScore');
      } else {
        group.status = "ongoing";
      }

      await leaderboard.save({ session });
      await group.save({ session });

      // Check if all groups in the round are completed
      if (group.roundId && group.roundId._id) {
        const allGroupsQuery = Group.find({ roundId: group.roundId._id });
        if (session) allGroupsQuery.session(session);
        const allGroupsInRound = await allGroupsQuery;
        const isRoundComplete = allGroupsInRound.every(g => g.status === 'completed');

        if (isRoundComplete) {
          const updateRoundQuery = Round.findByIdAndUpdate(group.roundId._id, { status: 'completed' });
          if (session) updateRoundQuery.session(session);
          await updateRoundQuery;

          if (allGroupsInRound.length === 1 && group.roundId.eventId) {
            const updateEventQuery = mongoose.model("Event").findByIdAndUpdate(group.roundId.eventId, { eventProgress: 'completed' });
            if (session) updateEventQuery.session(session);
            await updateEventQuery;
          }
        }
      }

      return { leaderboard, group };
    });

    if (res.headersSent) return;

    res.status(200).json({ message: "Results updated successfully", leaderboard, group });
  } catch (error) {
    logger.error("Error updating group results:", error);
    const statusCode = (error.status && error.status >= 400 && error.status < 500) ? error.status : 500;
    res.status(statusCode).json({
      message: error.message || "Internal Server Error",
      ...(error.matchesPlayed !== undefined && { matchesPlayed: error.matchesPlayed }),
      ...(error.totalMatch !== undefined && { totalMatch: error.totalMatch }),
    });
  }
};
